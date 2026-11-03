# Research notes: scholarships.json

Checked on 2026-11-04. The dataset has 35 programs. Every fact comes from the provider's own site: an agency, LGU, foundation or university domain, including CHED's `legacy.ched.gov.ph` and DOST-SEI's `science-scholarships.ph`. Aggregator and news sites were used only to find programs.

## How URLs were checked

- Each item has a `url_check` field. Most URLs returned HTTP 200 to curl.
- Some sites block curl with HTTP 403 but loaded normally in a browser, where their content was read: owwa.gov.ph and securitybank.com.
- The DOST-SEI and CHED BPMS sites are JavaScript apps. curl gets HTTP 200 but almost no text, so their content was read in a browser.
- `ched.gov.ph` (the main site) showed a Cloudflare challenge. It was not bypassed. CHED facts come from `legacy.ched.gov.ph` and `bpms.ched.gov.ph`.
- `unifast.gov.ph` returned HTTP 522 (origin down). TES and TDP facts come from CHED's "2025 Updated" brochures on legacy.ched.gov.ph.

## Dropped programs

| Program | Reason |
|---|---|
| Landbank Gawad Patnubay | The official page now gives a "page can't be found" soft 404 in a browser and a bot wall to fetchers. Search snippets of the page showed "Period of implementation: 2012-2021". Treated as ended. |
| Iskolar ng LANDBANK (successor) | Landbank news URLs about it now give "page can't be found". The program could not be verified on an official page. Facts seen only on news and aggregator sites. |
| Metrobank Foundation scholarship (incl. "MetroGold") | mbfoundation.org.ph is behind a Cloudflare challenge (403). Not verified on an official page. A Silliman University page announces a 2026-2030 cycle. |
| Jollibee Group Foundation (ACE Scholarship) | jollibeegroupfoundation.org did not resolve or connect. No official page found. |
| PLDT-Smart Foundation | pldtsmartfoundation.org returned 403. No scholarship page verified. |
| Cebuana Lhuillier Foundation | Foundation domain did not connect. Only aggregator and partner-school pages (e.g. PLM, 2020-21) were found. |
| Petron Tulong Aral ng Petron (TAP) | Verified on petron.com, but the page gives no eligibility or application route. It is limited to host communities of Petron terminals, with scholars chosen with DSWD, DepEd and the LGU. Left out because students cannot apply directly. Could be added as an informational entry. |
| Pilipinas Shell Foundation (Shell-PhilDev Scholarship) | The official page has no eligibility, benefits or application information. The page footer is from 2020. |
| Ayala Foundation / GCash U-GO Scholar Grant | The official article (8 Jun 2026) gives no eligibility details, amounts or way to apply. |
| BPI Foundation | No current scholarship program is listed among its programs. The only scholar news item dates from 2021. |
| Puregold, Coca-Cola Foundation Philippines | Sites returned 502 or did not connect. Nothing verified. |
| PAGCOR | No national scholarship program on pagcor.ph. News (Jul 2026) reports PAGCOR funding of PHP 60M for Bulacan's provincial AHT scholarship, which is an LGU program and was not verified on an official page. |
| SSS | No SSS scholarship program found. |
| DOST-SEI senior high scholarship | No DOST-SEI scholarship for SHS students is listed on science-scholarships.ph. |
| TESDA PESFA | The TESDA page has only a one-line description (RA 8545, grants for "qualified and deserving college freshmen") and 2018-2022 circulars. There was not enough to record. |
| DSWD AICS educational assistance | aics.dswd.gov.ph lists "education" as a type of AICS help but gives no eligibility, amounts or frequency. The DSWD page that news linked to now returns 404. Amounts seen in 2022 news were not used. |
| BFAR scholarship | No BFAR scholarship page found on bfar.da.gov.ph. Fisheries students are covered under ACEF-GIAHEP. |
| Makati City scholarship | makati.gov.ph is a JS portal with no scholarship content found. Only aggregator pages describe the "Makati City Revitalized Scholarship Program". |
| Manila City scholarship | manila.gov.ph returned 403. Only news reports of one-off cash aid were found. |
| Cebu City College Scholarship Program | No program page on cebucity.gov.ph. News sources disagree on the ordinance (No. 2333 vs No. 2339) and on amounts. |
| UP (Socialized Tuition System / STFAP) | Most UP undergraduates are now covered by free tuition under RA 10931 (see `ched-free-higher-education`). No current official STS/STFAP page was found. |
| CHED SIKAP, ESTATISKOLAR, MTP-SP, SIDA-SGP, CGMS-SUCs | Found on CHED's StuFAPs page but not researched in depth, to stay in scope. Candidates for a later pass. |
| CHED thesis/dissertation grants, SPPIC | Shown as suspended on legacy.ched.gov.ph/grants/. |
| DepEd ESC (junior high) | Verified on peac.org.ph, but it covers Grades 7-10, which are outside this dataset's level tags. |

## Facts that conflict or need care

1. **BPMSP excellence incentive.** The bpms.ched.gov.ph home page says top 10 per term per region. The FAQ says PHP 18,000 per term to the top 15 per region. The dataset uses the FAQ figure. The BPMSP application window (secondary sources say 30 Apr - 30 Jun 2026) is not shown on the official portal, so `application_period` is null.
2. **CMSP vs BPMSP for AY 2026-2027.** The latest CMSP call on CHED's page is AY 2025-2026 (deadline 20 Jun 2025). BPMSP was launched for AY 2026-2027. It is unclear whether CMSP had a separate 2026-2027 call.
3. **TES/TDP amounts.** These come from CHED's "2025 Updated" brochures (TES: PHP 20,000 SUC/LUC, PHP 27,000 private HEI; TDP: PHP 7,500 per semester). Aggregators mention revised 2026 guidelines (UniFAST MC No. 1, s. 2026). These could not be checked because unifast.gov.ph was down.
4. **Davao EBSU SY 2025-2026 window.** One city article (23 Apr 2025) says 21-30 Apr 2025. Another (23 Jun 2025) says 21 Apr - 7 May, possibly an extension. A SunStar report says the 2026-2027 window was 6-24 Apr 2026, but no official city page confirms it.
5. **DOST JLSS exam date.** The program page lists 28 Jun 2026. The DOST-SEI results article says exams were held on 28 Jun and 5 Jul 2026.
6. **DOST-SEI privileges tables** on science-scholarships.ph carry no AY label. They are recorded as displayed on 2026-11-04.
7. **MSRS internship totals** on CHED's page do not add up once the one-time PHP 16,000 review fee is included.
8. **DLSU SLS grant.** The AY 2027-2028 schedule lists a Batch 2 evaluation date of 29 Apr 2026, which looks like a typo for 2027.
9. **TESDA STEP PHP 60/day allowance.** The program text on TESDA's page is undated and sits next to 2018-2022 circulars. It may be outdated. TESDA's FY 2026 omnibus guidelines were not found on tesda.gov.ph.
10. **Ateneo Magis.** The text refers to selection from first-years of SY 2025-2026, so it may be stale. The "Applying for Financial Aid" page returned 403, so no deadline was recorded.
11. **CoScho benefit amounts** are only in an image on CHED's page and were not recorded.
12. **PEAC SHS voucher values** were not found on the PEAC pages reviewed. Category definitions and dates come from PEAC's infographic images.

## Fields

- `url_check` was added beside the requested schema fields to record the HTTP status and how the page was read.
- `null` means the official source does not state the fact. Lists are never padded with guesses.
