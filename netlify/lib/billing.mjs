/* Billing disclosure for everything charged through Stripe.
   Stripe is used ONLY by the Software Department (NspirePro apps, software
   licenses/invoices). Workshops and trainings stay on Square, billed by
   Kendra REAC Consultant, Inc. — never route them through Stripe.
   Used today by invoice footers; DISCLOSURE / STATEMENT_SUFFIX are the exact
   wording and suffix the app's Stripe checkout should use too.
   Keep this text in sync with the "Payments and billing disclosure" section of
   /terms/ and with the statement descriptor configured in the Stripe Dashboard
   (Settings → Business → Public details: prefix "KENDRA REAC"). */

export const LEGAL_NAME = "Kendra REAC Consultant, Inc.";
export const DEPARTMENT = "Software Department";
export const PAYEE_ACCOUNT = "National Pro Inspections";

// Card statements show "<prefix>* <suffix>", max 22 characters in total.
// Prefix "KENDRA REAC" (Dashboard) + suffix "SOFTWARE" = "KENDRA REAC* SOFTWARE".
export const STATEMENT_SUFFIX = "SOFTWARE";
export const STATEMENT_TEXT = "KENDRA REAC* SOFTWARE";
// Invoices take a full descriptor, where "*" is not allowed.
export const INVOICE_STATEMENT = "KENDRA REAC SOFTWARE";

const text = (stmt) => ({
  en: `Billing disclosure: This charge is billed by the ${DEPARTMENT} of ${LEGAL_NAME} Payments are deposited to the business bank account of ${PAYEE_ACCOUNT}. Your bank or card statement will show "${stmt}". Questions: kendra@reacnspire.com · (407) 516-5393.`,
  es: `Aviso de facturación: Este cargo lo factura el Departamento de Software (${DEPARTMENT}) de ${LEGAL_NAME} Los pagos se depositan en la cuenta bancaria comercial de ${PAYEE_ACCOUNT}. Su estado de cuenta mostrará "${stmt}". Preguntas: kendra@reacnspire.com · (407) 516-5393.`,
});

export const DISCLOSURE = text(STATEMENT_TEXT);
// Invoices are read by both audiences, so they carry both languages.
const inv = text(INVOICE_STATEMENT);
export const INVOICE_FOOTER = `${inv.en}\n\n${inv.es}`;
