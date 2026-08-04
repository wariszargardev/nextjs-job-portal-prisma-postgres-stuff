"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { QuoteTypeId } from "@/lib/imcrm/constants/quoteTypeId";
import type { toDocumentTypeResource } from "@/lib/imcrm/resources/documentTypeResource";

type DocumentTypeValues = ReturnType<typeof toDocumentTypeResource>;
type QuoteTypeOption = { id: number; text: string | null };

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

export function DocumentTypeForm({
  documentType,
  quoteTypes,
}: {
  documentType?: DocumentTypeValues;
  quoteTypes: QuoteTypeOption[];
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, setPending] = useState(false);
  const [quoteTypeId, setQuoteTypeId] = useState(documentType?.quoteTypeId?.toString() ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const optional = (key: string) => {
      const value = formData.get(key);
      return value ? value : undefined;
    };
    const optionalNumber = (key: string) => {
      const value = formData.get(key);
      return value ? Number(value) : undefined;
    };

    const payload = {
      code: formData.get("code"),
      text: formData.get("text"),
      description: optional("description"),
      isActive: formData.get("isActive") === "on",
      quoteTypeId: optionalNumber("quoteTypeId"),
      folderPath: optional("folderPath"),
      acceptedFiles: optional("acceptedFiles"),
      maxFiles: Number(formData.get("maxFiles") || 1),
      maxSize: Number(formData.get("maxSize") || 5),
      isRequired: formData.get("isRequired") === "on",
      sendToCustomer: formData.get("sendToCustomer") === "on",
      receiveFromCustomer: formData.get("receiveFromCustomer") === "on",
      sortOrder: optionalNumber("sortOrder"),
      category: formData.get("category"),
      isRequiredForSendPolicy: formData.get("isRequiredForSendPolicy") === "on",
      businessTypeOfInsuranceId: optionalNumber("businessTypeOfInsuranceId"),
      businessTypeOfCustomer: optional("businessTypeOfCustomer"),
      toolTip: optional("toolTip"),
      registrationType: optional("registrationType"),
      vehicleUse: optional("vehicleUse"),
      isRestrictedInternalDocument: formData.get("isRestrictedInternalDocument") === "on",
    };

    const url = documentType ? `/api/imcrm/document-types/${documentType.id}` : "/api/imcrm/document-types";
    const method = documentType ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPending(false);

    if (response.status === 422) {
      const { errors: fieldErrors } = await response.json();
      setErrors(fieldErrors ?? {});
      return;
    }

    if (!response.ok) {
      setErrors({ form: ["Something went wrong. Please try again."] });
      return;
    }

    router.push("/admin/imcrm/document-types");
    router.refresh();
  }

  const isCompanyCar = quoteTypeId === String(QuoteTypeId.CompanyCar);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormSection title="Identity" description="How this document type is named and referenced.">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" defaultValue={documentType?.code} required disabled={!!documentType} />
          {documentType && <p className="text-xs text-slate-400">Code can&apos;t be changed after creation.</p>}
          {errors.code && <p className="text-sm text-red-600">{errors.code[0]}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="text">Text</Label>
          <Input id="text" name="text" defaultValue={documentType?.text} required />
          {errors.text && <p className="text-sm text-red-600">{errors.text[0]}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" name="description" defaultValue={documentType?.description ?? ""} />
        </div>
      </FormSection>

      <FormSection title="Classification" description="Which quote flow and business context this applies to.">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue={documentType?.category ?? "QUOTE"}>
            <option value="QUOTE">Quote</option>
            <option value="MEMBER">Member</option>
            <option value="ISSUING_DOCUMENTS">Issuing documents</option>
            <option value="SEND_UPDATE">Send update</option>
            <option value="ENDORSEMENT_DOCUMENTS">Endorsement documents</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quoteTypeId">Quote type</Label>
          <Select
            id="quoteTypeId"
            name="quoteTypeId"
            value={quoteTypeId}
            onChange={(e) => setQuoteTypeId(e.target.value)}
          >
            <option value="">None</option>
            {quoteTypes.map((qt) => (
              <option key={qt.id} value={qt.id}>
                {qt.text ?? qt.id}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessTypeOfInsuranceId">Business type of insurance ID (optional)</Label>
            <Input
              id="businessTypeOfInsuranceId"
              name="businessTypeOfInsuranceId"
              type="number"
              defaultValue={documentType?.businessTypeOfInsuranceId ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessTypeOfCustomer">Business type of customer (optional)</Label>
            <Select
              id="businessTypeOfCustomer"
              name="businessTypeOfCustomer"
              defaultValue={documentType?.businessTypeOfCustomer ?? ""}
            >
              <option value="">None</option>
              <option value="IBTC">IBTC</option>
              <option value="CBTC">CBTC</option>
            </Select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Upload rules" description="Constraints applied when a customer uploads this document.">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="acceptedFiles">Accepted files (comma-separated extensions)</Label>
          <Input
            id="acceptedFiles"
            name="acceptedFiles"
            placeholder=".pdf,.jpg,.png"
            defaultValue={documentType?.acceptedFiles ?? ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maxFiles">Max files</Label>
            <Input id="maxFiles" name="maxFiles" type="number" min={1} defaultValue={documentType?.maxFiles ?? 1} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maxSize">Max size (MB)</Label>
            <Input id="maxSize" name="maxSize" type="number" min={1} defaultValue={documentType?.maxSize ?? 5} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="folderPath">Folder path (optional)</Label>
          <Input id="folderPath" name="folderPath" defaultValue={documentType?.folderPath ?? ""} />
        </div>
      </FormSection>

      <FormSection title="Behavior flags">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {(
            [
              ["isActive", "Active", documentType?.isActive ?? true],
              ["isRequired", "Required", documentType?.isRequired ?? false],
              ["sendToCustomer", "Send to customer", documentType?.sendToCustomer ?? false],
              ["receiveFromCustomer", "Receive from customer", documentType?.receiveFromCustomer ?? false],
              ["isRequiredForSendPolicy", "Required for send policy", documentType?.isRequiredForSendPolicy ?? false],
              [
                "isRestrictedInternalDocument",
                "Restricted internal document",
                documentType?.isRestrictedInternalDocument ?? false,
              ],
            ] as const
          ).map(([name, label, defaultChecked]) => (
            <label key={name} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-brand-600" />
              {label}
            </label>
          ))}
        </div>
      </FormSection>

      {isCompanyCar && (
        <FormSection title="Vehicle-specific" description="Only shown for the Company Car quote type.">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registrationType">Registration type (optional)</Label>
              <Input id="registrationType" name="registrationType" defaultValue={documentType?.registrationType ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vehicleUse">Vehicle use (optional)</Label>
              <Input id="vehicleUse" name="vehicleUse" defaultValue={documentType?.vehicleUse ?? ""} />
            </div>
          </div>
        </FormSection>
      )}

      <FormSection title="Display">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="toolTip">Tool tip (optional)</Label>
          <Input id="toolTip" name="toolTip" defaultValue={documentType?.toolTip ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sortOrder">Sort order (optional)</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={documentType?.sortOrder ?? ""} />
        </div>
      </FormSection>

      {errors.form && <p className="text-sm text-red-600">{errors.form[0]}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          {pending ? "Saving..." : documentType ? "Save changes" : "Create document type"}
        </Button>
        <Link href="/admin/imcrm/document-types" className={cn(buttonVariants({ variant: "ghost" }))}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
