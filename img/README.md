# SellerId Loss Investigation and Fix Package

Date: 2026-02-27

## Scope
- Runtime fix in `listing-contact` (Scala flow where `sellId` is lost before messagebag serialization).
- Template hardening verification in this repository (`templates/gwp/*`).

## Root Cause (Confirmed)
The loss is in `listing-contact`, not in this template repo.

- `app/contactdata/UpsResponseParser.scala:29`
  `SellId = None` for UPS/private path.
- `app/models/ArticleDetailsFromListingFactory.scala:44`
  `sellId = contactData.SellId.filter(_ != 0)` (drops `0`).
- `app/serialization/MessageBagXmlSerializer.scala:90`
  `sellId.getOrElse("")` emits empty `<sellid/>` when missing.

## Proposed Runtime Fix (Implemented Locally)
Implemented in `C:\Users\rgryncewicz\AutoScout24\listing-contact`:

- Add request-level sell id capture:
  - `app/data/ContactResource.scala`
    - `RequestContactResource.SellId: Option[Long]`
    - decode support for both `sellId` and `sellerId` keys (case-insensitive decoder)
    - `ContactResource.sellId: Option[Long]`
- Preserve validated request sell id:
  - `app/controllers/validations/ContactResourceValidation.scala:105`
    - `contactResource.SellId.filter(_ != 0)` propagated into `ContactResource`.
- Fallback in message model construction:
  - `app/models/MessageModelFactory.scala`
    - `resolvedSellId = customerInfo.sellId.orElse(contactResource.sellId.filter(_ != 0))`
    - `CustomerMessageModel.sellId = resolvedSellId.map(_.toString)`.

Behavior after fix:
- Preferred source: `customerInfo.sellId` (existing behavior preserved).
- Fallback source: inbound request `sellId/sellerId`.
- Result: avoids empty `<sellid/>` when contact-data source lacks seller id but request contains it.

## Test Evidence

### 1) Compile gate (Java 21)
Command:
- `sbt compile`

Result:
- PASS on Corretto 21 (`Java 21.0.10`).

### 2) Executable smoke checks (fix behavior)
Command:
- `sbt "runMain tools.SellIdFixSmokeTest"`

Observed output:
- `PASS: case-insensitive decoder maps sellId -> RequestContactResource.SellId`
- `PASS: case-insensitive decoder maps sellerId alias -> RequestContactResource.SellId`
- `PASS: customer model uses request sellId when customer info sellId is missing`
- `PASS: customer model prefers customer info sellId over request sellId`
- `All sellId fix smoke checks passed.`

### 3) Unit tests in `test/` scope
Attempted command:
- `sbt "testOnly data.ContactResourceSpec models.MessageModelFactorySpec"`

Current blocker:
- Repository-wide `test` compilation fails on pre-existing Java 21 deprecation-as-error configuration (`new Locale(...)` across unrelated test files).
- This blocker is unrelated to sellerId changes.

### 4) AWS read-only replay status for listing-contact resources
Attempted read-only access to listing-contact target queues from `conf/application.conf`:
- `https://sqs.eu-west-1.amazonaws.com/184239733463/lead-emails`
- `https://sqs.eu-west-1.amazonaws.com/717037947466/as24-partner-emails-queue`
- `https://sqs.eu-west-1.amazonaws.com/717037947466/as24-leasingmarkt-emails-queue`

Result:
- Access denied from current SSO role (`364221166802 AdminAccess`), because resource policies do not allow `sqs:GetQueueAttributes`.
- Current SSO account list for this identity does not include accounts `184239733463` and `717037947466`.

Impact:
- End-to-end AWS replay for listing-contact output path cannot be executed from this workstation with current permissions.
- Functional fix-path evidence is therefore based on compile + executable runtime smoke checks in listing-contact code.

## Template Hardening Status (This Repo)
Verification command scanned all local XML templates.

Current files and sellerId presence:
- `templates/gwp/fr-BE/contactForDealer.xml`: 2 occurrences, first at line 740.
- `templates/gwp/fr-BE/ContactForDealerResponsive.xml`: 1 occurrence, first at line 722.
- `templates/gwp/nl-BE/contactForDealer.xml`: 2 occurrences, first at line 741.
- `templates/gwp/nl-BE/ContactForDealerResponsive.xml`: 1 occurrence, first at line 723.

Conclusion:
- No missing `<sellerId><Variable name="customer_sellid"/></sellerId>` in local template files.

## Flow Artifacts

### Mermaid sources
- `docs/sellerid-fix/sellerid-fix-flow.mmd`
- `docs/sellerid-fix/sellerid-fix-sequence.mmd`

### Rendered diagrams
- `docs/sellerid-fix/sellerid-fix-flow.svg`
- `docs/sellerid-fix/sellerid-fix-flow.png`
- `docs/sellerid-fix/sellerid-fix-sequence.svg`
- `docs/sellerid-fix/sellerid-fix-sequence.png`

## Decision Point Before PR
- Runtime fix is implemented and smoke-verified.
- Template files in this repo are already hardened.
- Full `test/` suite is currently blocked by unrelated Java 21 deprecation failures.

Recommended PR strategy:
- Open PR with runtime fix + diagrams + this report.
- Explicitly mention the pre-existing Java 21 test-suite blocker in PR notes.
