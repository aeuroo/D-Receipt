"use client";

import { motion } from "framer-motion";

import { NotesSection } from "@/components/receipt/NotesSection";
import { PresetPicker } from "@/components/ui/PresetPicker";
import { SelectField } from "@/components/ui/SelectField";
import { useLocale } from "@/lib/i18n/locale-context";
import type { NotePresetId } from "@/lib/i18n/messages";
import {
  getServicePresetOptions,
  toggleNotePresetInList,
} from "@/lib/i18n/translate";
import { PRICE_PRESETS } from "@/lib/constants";
import { generateReceiptNumber } from "@/lib/document-utils";
import { smoothTransition, springGentle } from "@/lib/motion";
import type { LineItem, ReceiptFormData } from "@/lib/types";

type Props = {
  formData: ReceiptFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReceiptFormData>>;
};

const fieldClass = "field-input";

export function ReceiptForm({ formData, setFormData }: Props) {
  const { locale, t } = useLocale();
  const servicePresets = getServicePresetOptions(locale);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    const next = { ...formData, [name]: value } as ReceiptFormData;
    if (name === "date") {
      next.receiptNumber = generateReceiptNumber(value);
    }
    setFormData(next);
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const items = [...formData.items];
    const current = { ...items[index] };
    if (field === "quantity") {
      current.quantity = Number(value) || 1;
    } else if (field === "price") {
      current.price = Number(value) || 0;
    } else {
      current.description = String(value);
    }
    items[index] = current;
    setFormData({ ...formData, items });
  };

  const removeItem = (index: number) => {
    const items = formData.items.filter((_, i) => i !== index);
    if (items.length === 0) {
      items.push({ description: "", quantity: 1, price: 0 });
    }
    setFormData({ ...formData, items });
  };

  const toggleNote = (id: NotePresetId) => {
    setFormData({
      ...formData,
      noteChecklist: toggleNotePresetInList(
        locale,
        id,
        formData.noteChecklist,
      ),
    });
  };

  return (
    <form
      className="space-y-4 sm:space-y-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={smoothTransition}
        className="space-y-2"
      >
        <label className="label-text">{t("form.receiptNumber")}</label>
        <input
          type="text"
          name="receiptNumber"
          value={formData.receiptNumber}
          readOnly
          className={fieldClass}
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-text mb-2 block">{t("form.docType")}</label>
          <SelectField name="type" value={formData.type} onChange={handleChange}>
            <option value="receipt">{t("docType.receipt")}</option>
            <option value="quotation">{t("docType.quotation")}</option>
            <option value="invoice">{t("docType.invoice")}</option>
            <option value="custom">{t("docType.custom")}</option>
          </SelectField>
        </div>
        <div>
          <label className="label-text mb-2 block">{t("form.date")}</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={fieldClass}
          />
        </div>
      </div>

      {formData.type === "custom" && (
        <div>
          <label className="label-text mb-2 block">{t("form.customType")}</label>
          <input
            type="text"
            name="customDocumentTitle"
            value={formData.customDocumentTitle}
            onChange={handleChange}
            placeholder={t("form.customTypePlaceholder")}
            className={fieldClass}
          />
        </div>
      )}

      <section className="liquid-inset p-3 sm:p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-[0.9375rem] font-semibold tracking-tight text-[var(--text-primary)]">
            {t("form.sectionInfo")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(["company", "customer"] as const).map((type) => (
              <label
                key={type}
                data-on={formData.infoType === type}
                className="chip-toggle"
              >
                <input
                  type="radio"
                  name="infoType"
                  value={type}
                  checked={formData.infoType === type}
                  onChange={handleChange}
                  className="sr-only"
                />
                {type === "company" ? t("form.infoCompany") : t("form.infoCustomer")}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {formData.infoType === "company" ? (
            <>
              <Field label={t("form.companyName")} name="companyName" value={formData.companyName} onChange={handleChange} />
              <Field label={t("form.companyAddress")} name="address" value={formData.address} onChange={handleChange} textarea />
              <Field label={t("form.phone")} name="companyPhone" value={formData.companyPhone} onChange={handleChange} placeholder={t("form.phoneCompanyPh")} />
              <Field label={t("form.taxId")} name="taxId" value={formData.taxId} onChange={handleChange} />
              <Field label={t("form.operator")} name="operator" value={formData.operator} onChange={handleChange} placeholder={t("form.operatorPh")} />
            </>
          ) : (
            <>
              <Field label={t("form.customerName")} name="customerName" value={formData.customerName} onChange={handleChange} />
              <Field label={t("form.customerAddress")} name="customerAddress" value={formData.customerAddress} onChange={handleChange} textarea />
              <Field label={t("form.phone")} name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder={t("form.phoneCustomerPh")} />
            </>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[0.9375rem] font-semibold tracking-tight text-[var(--text-primary)]">
          {t("form.items")}
        </h3>
        {formData.items.map((item, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springGentle}
            className="liquid-inset p-3 sm:p-4"
          >
            <label className="label-text mb-2 block">
              {t("form.itemN", { n: index + 1 })}
            </label>
            <div className="flex gap-2">
              <textarea
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                rows={1}
                placeholder={t("form.itemPh", { n: index + 1 })}
                className={`${fieldClass} min-h-[42px] resize-none`}
              />
              <PresetPicker
                ariaLabel={t("form.presetService")}
                title={t("form.presetService")}
                options={servicePresets.map((preset) => ({
                  value: preset.label,
                  label: preset.label,
                }))}
                onSelect={(value) => updateItem(index, "description", value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-text mb-2 block">{t("form.quantity")}</label>
                <SelectField
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </SelectField>
              </div>
              <div>
                <label className="label-text mb-2 block">{t("form.price")}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.price === 0 ? "" : item.price}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      updateItem(index, "price", Math.max(0, Number.isNaN(val) ? 0 : val));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "Minus") e.preventDefault();
                    }}
                    className={fieldClass}
                  />
                  <PresetPicker
                    ariaLabel={t("form.presetPrice")}
                    title={t("form.presetPrice")}
                    options={PRICE_PRESETS.map((price) => ({
                      value: String(price),
                      label: price.toLocaleString(),
                    }))}
                    onSelect={(value) =>
                      updateItem(index, "price", parseInt(value, 10))
                    }
                  />
                </div>
              </div>
            </div>

            {formData.items.length > 1 && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200/80 transition hover:bg-red-100 hover:text-red-700 hover:ring-red-300 active:scale-95"
                  aria-label={t("form.removeItem")}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        ))}

        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          transition={springGentle}
          onClick={() =>
            setFormData({
              ...formData,
              items: [...formData.items, { description: "", quantity: 1, price: 0 }],
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-[rgba(0,122,255,0.35)] bg-white/70 py-2.5 text-sm font-semibold text-[#007aff] transition duration-300 hover:bg-white active:scale-[0.99]"
        >
          <span className="text-lg leading-none">+</span>
          {t("form.addItem")}
        </motion.button>

        <NotesSection
          formData={formData}
          onToggle={toggleNote}
          onNoteChange={handleChange}
        />
      </section>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  textarea?: boolean;
  placeholder?: string;
}) {
  const fieldClass = "field-input";

  return (
    <div>
      <label className="label-text mb-2 block">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          className={`${fieldClass} min-h-[80px] resize-none`}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
    </div>
  );
}
