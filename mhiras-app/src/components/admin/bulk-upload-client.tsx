"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Layers, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createProductsBulk } from "@/app/actions/bulk-products";
import { SIZE_CHART } from "@/lib/size-guide";
import {
  MAX_BULK_IMAGES,
  MAX_BULK_ITEMS,
  autoProductName,
  categoryNamePrefix,
  type BulkCategory,
  type BulkProductInput,
} from "@/lib/bulk-upload";
import { useImageStaging } from "@/components/admin/bulk-image-staging";
import {
  BatchDefaultsPanel,
  type BatchDefaults,
} from "@/components/admin/bulk-batch-defaults";
import {
  BulkProductRow,
  type RowOverride,
} from "@/components/admin/bulk-product-row";

const CHART_SIZES = new Set(SIZE_CHART.map((row) => row.size));

const EMPTY_DEFAULTS: BatchDefaults = {
  categoryId: "",
  sellingPrice: "",
  originalPrice: "",
  condition: "GOOD",
  status: "PUBLISHED",
  stock: "1",
  sizes: [],
  description: "",
  featured: false,
  namePrefix: "",
  startNumber: "1",
};

export function BulkUploadClient({
  categories,
}: {
  categories: BulkCategory[];
}) {
  const {
    rows,
    counts,
    add,
    remove,
    retry,
    retryFailed,
    clear,
    group,
    ungroup,
    groupEvery,
    promote,
  } = useImageStaging();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [defaults, setDefaults] = useState<BatchDefaults>(EMPTY_DEFAULTS);
  const [overrides, setOverrides] = useState<Record<string, RowOverride>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [perProduct, setPerProduct] = useState("2");
  const [rejections, setRejections] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  /** Row problems stay hidden until the admin actually tries to save. */
  const [showIssues, setShowIssues] = useState(false);
  const [serverIssues, setServerIssues] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const category = categories.find((c) => c.id === defaults.categoryId);
  const showSizes = category?.kind !== "WHOLESALE";
  const uploading = counts.busy > 0;
  const tooManyProducts = counts.products > MAX_BULK_ITEMS;

  // Photos live only in this tab until they're saved — closing mid-upload
  // throws the work away.
  useEffect(() => {
    if (!uploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);

  /**
   * Picking a category re-seeds the fields it implies — the name prefix, where
   * numbering continues from, and the sizes that category normally carries.
   */
  function updateDefaults(patch: Partial<BatchDefaults>) {
    setDefaults((current) => {
      if (patch.categoryId === undefined || patch.categoryId === current.categoryId) {
        return { ...current, ...patch };
      }

      const picked = categories.find((c) => c.id === patch.categoryId);
      return {
        ...current,
        ...patch,
        namePrefix: picked ? categoryNamePrefix(picked.name) : "",
        startNumber: picked ? String(picked.productCount + 1) : "1",
        // Filtered against the size chart: a stray value in the category's
        // CSV would otherwise get rejected by the server on every row.
        sizes:
          picked?.sizeOptions
            ?.split(",")
            .map((s) => s.trim())
            .filter((s) => CHART_SIZES.has(s)) ?? [],
      };
    });
  }

  const startNumber = Math.max(1, parseInt(defaults.startNumber, 10) || 1);

  const autoNames = useMemo(
    () =>
      rows.map((_, i) =>
        defaults.namePrefix.trim()
          ? autoProductName(defaults.namePrefix.trim(), startNumber + i)
          : ""
      ),
    [rows, defaults.namePrefix, startNumber]
  );

  /** Each row resolved against the batch defaults — what actually gets saved. */
  const effective = useMemo(
    () =>
      rows.map((row, i) => {
        const override = overrides[row.groupId] ?? {};
        return {
          groupId: row.groupId,
          images: row.images,
          name: override.name?.trim() || autoNames[i],
          price: (override.price ?? "").trim() || defaults.sellingPrice.trim(),
          // Bales aren't sold by size, whatever the batch panel last held.
          sizes: showSizes ? (override.sizes ?? defaults.sizes) : [],
        };
      }),
    [rows, overrides, autoNames, defaults.sellingPrice, defaults.sizes, showSizes]
  );

  const rowIssues = useMemo(() => {
    const found: Record<string, string> = {};
    for (const row of effective) {
      if (!row.name) {
        found[row.groupId] =
          "Needs a name — type one, or set a name prefix above.";
      } else if (!/^\d+$/.test(row.price) || parseInt(row.price, 10) <= 0) {
        found[row.groupId] = "Needs a selling price above ₦0.";
      } else if (row.images.some((img) => img.status === "error")) {
        found[row.groupId] = "A photo failed to upload — retry or remove it.";
      } else if (row.images.some((img) => img.status !== "done")) {
        found[row.groupId] = "Photos are still uploading.";
      }
    }
    return found;
  }, [effective]);

  const visibleIssues = showIssues
    ? { ...rowIssues, ...serverIssues }
    : serverIssues;

  /**
   * Why saving is off limits right now, or null if it isn't. Row-level problems
   * deliberately aren't in here — the admin should press Save and be shown
   * exactly which rows are wrong, not face a dead button with no explanation.
   */
  const saveBlocker: string | null = uploading
    ? `Waiting for ${counts.busy} photo${counts.busy === 1 ? "" : "s"} to finish uploading...`
    : counts.failed > 0
      ? `${counts.failed} photo${counts.failed === 1 ? "" : "s"} failed to upload — retry or remove them.`
      : tooManyProducts
        ? `Too many products for one batch (limit ${MAX_BULK_ITEMS}).`
        : null;

  async function handleSave() {
    setServerIssues({});
    const stock = parseInt(defaults.stock, 10);

    if (!defaults.categoryId) {
      toastError("Pick a category for this batch.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      toastError("Stock per product must be 0 or more.");
      return;
    }
    if (effective.length === 0) {
      toastError("Add some photos first.");
      return;
    }
    if (effective.length > MAX_BULK_ITEMS) {
      toastError(`Save up to ${MAX_BULK_ITEMS} products at a time.`);
      return;
    }

    const originalPrice = defaults.originalPrice.trim()
      ? parseInt(defaults.originalPrice, 10)
      : null;
    if (originalPrice !== null && !Number.isInteger(originalPrice)) {
      toastError("Original price must be a whole number.");
      return;
    }

    const blocked = Object.keys(rowIssues).length;
    if (blocked > 0) {
      setShowIssues(true);
      toastError(
        `${blocked} product${blocked === 1 ? "" : "s"} still need attention.`
      );
      return;
    }

    const items: BulkProductInput[] = effective.map((row) => ({
      name: row.name,
      sellingPrice: parseInt(row.price, 10),
      originalPrice,
      sizes: row.sizes,
      stock,
      condition: defaults.condition as BulkProductInput["condition"],
      status: defaults.status as BulkProductInput["status"],
      description: defaults.description.trim() || null,
      featured: defaults.featured,
      images: row.images.flatMap((img) => (img.asset ? [img.asset] : [])),
    }));

    setSaving(true);
    const result = await createProductsBulk(defaults.categoryId, items);
    setSaving(false);

    if (result.issues) {
      setShowIssues(true);
      setServerIssues(
        Object.fromEntries(
          result.issues.flatMap((issue) => {
            const row = effective[issue.index];
            return row ? [[row.groupId, issue.message]] : [];
          })
        )
      );
      toastError("Some products were rejected — nothing was saved.");
      return;
    }

    if (result.error) {
      toastError(result.error);
      return;
    }

    success(
      `${result.created} product${result.created === 1 ? "" : "s"} created.`
    );
    router.push("/admin/products");
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const { rejected } = add(Array.from(fileList));
    setRejections(rejected);
  }

  function toggleSelected(groupId: string, on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(groupId);
      else next.delete(groupId);
      return next;
    });
  }

  function groupSelected() {
    const result = group([...selected]);
    if (!result.ok) {
      toastError(result.message ?? "Couldn't group those.");
      return;
    }
    setSelected(new Set());
  }

  function removeRow(groupId: string, imageIds: string[]) {
    imageIds.forEach((id) => remove(id));
    setSelected((current) => {
      const next = new Set(current);
      next.delete(groupId);
      return next;
    });
  }

  function resetAll() {
    clear();
    setOverrides({});
    setSelected(new Set());
    setRejections([]);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone — compact once there's something to look at below. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors bg-white ${
          counts.total > 0 ? "py-4 px-6" : "p-10"
        } ${
          dragOver
            ? "border-copper bg-copper-light/30"
            : "border-border hover:border-charcoal-soft"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
        <Upload
          size={counts.total > 0 ? 18 : 28}
          className="mx-auto mb-2 text-charcoal-soft"
        />
        <p className="text-sm">
          {counts.total > 0
            ? "Add more photos"
            : "Drop the whole folder of photos here, or click to browse"}
        </p>
        {counts.total === 0 && (
          <p className="text-xs text-charcoal-soft mt-1">
            JPG, PNG, WebP or AVIF — large photos are resized automatically —
            up to {MAX_BULK_IMAGES} photos per batch
          </p>
        )}
      </div>

      {/* Files we wouldn't take */}
      {rejections.length > 0 && (
        <div className="bg-white border border-danger/40 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-2">
              <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">
                  {rejections.length} file
                  {rejections.length === 1 ? "" : "s"} skipped
                </p>
                <ul className="text-xs text-charcoal-soft space-y-0.5">
                  {rejections.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={() => setRejections([])}
              className="text-charcoal-soft hover:text-charcoal cursor-pointer"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {counts.total > 0 && (
        <BatchDefaultsPanel
          categories={categories}
          value={defaults}
          showSizes={showSizes}
          onChange={updateDefaults}
        />
      )}

      {/* Batch status + grouping controls */}
      {counts.total > 0 && (
        <div className="bg-white border border-border rounded-lg px-4 py-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm" aria-live="polite">
              <span className="font-medium">{counts.products}</span> product
              {counts.products === 1 ? "" : "s"} from {counts.total} photo
              {counts.total === 1 ? "" : "s"}
              <span className="text-charcoal-soft">
                {" · "}
                {counts.done} uploaded
                {counts.busy > 0 && ` · ${counts.busy} in progress`}
              </span>
              {counts.failed > 0 && (
                <span className="text-danger"> · {counts.failed} failed</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {counts.failed > 0 && (
                <Button variant="outline" size="sm" onClick={retryFailed}>
                  Retry failed
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={resetAll}>
                Clear all
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {selected.size > 0 ? (
              <>
                <span className="text-sm text-charcoal-soft">
                  {selected.size} selected
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={groupSelected}
                  disabled={selected.size < 2}
                >
                  <Layers size={13} className="mr-1.5" aria-hidden="true" />
                  Group into one product
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                >
                  Clear selection
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-charcoal-soft">
                  Shot the same number of angles each time?
                </span>
                <label className="flex items-center gap-2 text-sm">
                  <select
                    value={perProduct}
                    onChange={(e) => setPerProduct(e.target.value)}
                    className="border border-border rounded px-2 py-1.5 text-sm bg-white outline-none focus:border-copper"
                    aria-label="Photos per product"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} photo{n === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                  per product
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    groupEvery(parseInt(perProduct, 10));
                    setSelected(new Set());
                  }}
                >
                  Regroup all
                </Button>
              </>
            )}
          </div>

          {tooManyProducts && (
            <p className="text-xs text-danger border-t border-border pt-3">
              That&apos;s {counts.products} products — the limit is{" "}
              {MAX_BULK_ITEMS}{" "}
              per batch. Remove some photos or group more of them together.
            </p>
          )}
        </div>
      )}

      {/* One row per product */}
      {rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <BulkProductRow
              key={row.groupId}
              images={row.images}
              autoName={autoNames[i]}
              batchPrice={defaults.sellingPrice}
              batchSizes={defaults.sizes}
              showSizes={showSizes}
              override={overrides[row.groupId] ?? {}}
              issue={visibleIssues[row.groupId]}
              selected={selected.has(row.groupId)}
              onSelect={(on) => toggleSelected(row.groupId, on)}
              onChange={(patch) =>
                setOverrides((current) => ({
                  ...current,
                  [row.groupId]: { ...current[row.groupId], ...patch },
                }))
              }
              onUngroup={() => ungroup(row.groupId)}
              onRemove={() =>
                removeRow(
                  row.groupId,
                  row.images.map((img) => img.id)
                )
              }
              onRemoveImage={remove}
              onRetryImage={retry}
              onPromoteImage={promote}
            />
          ))}
        </div>
      )}

      {/* Save bar — sticks to the bottom so it's reachable from row 60. */}
      {counts.total > 0 && (
        <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-cream/95 backdrop-blur border-t border-border flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-charcoal-soft">
            {saveBlocker ??
              `${counts.products} product${
                counts.products === 1 ? "" : "s"
              } ready to create.`}
          </p>
          <div className="flex gap-2">
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || saveBlocker !== null}
            >
              {saving
                ? "Saving..."
                : `Save ${counts.products} product${
                    counts.products === 1 ? "" : "s"
                  }`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
