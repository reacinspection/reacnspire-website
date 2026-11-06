/* Seller disclosure for everything charged through Stripe.

   Stripe is used ONLY for NspirePro software, and the seller is a company
   SEPARATE from Kendra REAC Consultant, Inc.: <LEGAL_NAME> d/b/a National Pro
   Inspections. The Stripe account, its bank account and sales-tax registrations
   all belong to that company.
   Workshops, trainings, consulting and inspections are sold by Kendra REAC
   Consultant, Inc. through Square — never route them through Stripe.

   Keep this text in sync with the "Payments and billing disclosure" section of
   /terms/ and with the statement descriptor set in the Stripe Dashboard
   (Settings → Business → Public details). */

// TODO(owner): replace with the exact legal name of the company that owns the
// National Pro Inspections DBA (as registered with the state / on its EIN letter).
export const LEGAL_NAME = "[LEGAL COMPANY NAME]";
export const DBA = "National Pro Inspections";
export const SELLER = `${LEGAL_NAME} d/b/a ${DBA}`;
export const IS_CONFIGURED = !LEGAL_NAME.startsWith("[");

// Full statement descriptor (max 22 chars, letters/numbers/spaces).
// Set the same value in the Dashboard; shortened descriptor: "NATL PRO INSP".
export const STATEMENT = "NATL PRO INSPECTIONS";

export const DISCLOSURE = {
  en: `Seller disclosure: NspirePro software is sold and billed by ${SELLER}, a company separate from Kendra REAC Consultant, Inc. Your bank or card statement will show "${STATEMENT}". Billing questions: kendra@reacnspire.com · (407) 516-5393.`,
  es: `Aviso sobre el vendedor: El software NspirePro lo vende y factura ${SELLER}, una compañía separada de Kendra REAC Consultant, Inc. Su estado de cuenta mostrará "${STATEMENT}". Preguntas de facturación: kendra@reacnspire.com · (407) 516-5393.`,
};

// Invoices are read by both audiences, so they carry both languages.
export const INVOICE_FOOTER = `${DISCLOSURE.en}\n\n${DISCLOSURE.es}`;
