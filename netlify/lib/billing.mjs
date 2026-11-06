/* Seller disclosure for everything charged through Stripe.

   Stripe is used ONLY for NspirePro software, and the seller is a company
   SEPARATE from Kendra REAC Consultant, Inc.: JE BookKeeper LLC d/b/a National
   ProInspections. The Stripe account, its bank account and sales-tax registrations
   all belong to that company.
   Workshops, trainings, consulting and inspections are sold by Kendra REAC
   Consultant, Inc. through Square — never route them through Stripe.

   Keep this text in sync with the "Payments and billing disclosure" section of
   /terms/ and with the statement descriptor set in the Stripe Dashboard
   (Settings → Business → Public details). */

// Legal entity that owns the DBA, and the DBA exactly as registered.
export const LEGAL_NAME = "JE BookKeeper LLC";
export const DBA = "National ProInspections";
export const SELLER = `${LEGAL_NAME} d/b/a ${DBA}`;
export const IS_CONFIGURED = !LEGAL_NAME.startsWith("[");

// Full statement descriptor (max 22 chars, letters/numbers/spaces).
// Set the same value in the Dashboard; shortened descriptor: "NATL PRO INSP".
export const STATEMENT = "NATL PRO INSPECTIONS";

export const DISCLOSURE = {
  en: `Seller disclosure: NspirePro software is sold and billed by ${SELLER}, a company separate from Kendra REAC Consultant, Inc. Your bank or card statement will show "${STATEMENT}". Billing questions: administration@reacnspire.com · (407) 744-2644.`,
  es: `Aviso sobre el vendedor: El software NspirePro lo vende y factura ${SELLER}, una compañía separada de Kendra REAC Consultant, Inc. Su estado de cuenta mostrará "${STATEMENT}". Preguntas de facturación: administration@reacnspire.com · (407) 744-2644.`,
};

// Invoices are read by both audiences, so they carry both languages.
export const INVOICE_FOOTER = `${DISCLOSURE.en}\n\n${DISCLOSURE.es}`;
