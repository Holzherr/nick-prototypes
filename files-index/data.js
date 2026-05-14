// Auto-generated. Edit by hand to refine — values are best-effort from extraction.
window.DATA = {
  "meta": {
    "greeting": "Welcome back",
    "runId": "20260508-131401",
    "company": ""
  },
  "profilePlaybook": {
    "id": "general",
    "title": "General playbook",
    "body": "# General Playbook — Cross-cutting Foodient/Whisk posture\n\nCross-cutting drafting and review patterns that apply across categories. Per-category playbooks pick up the rest.\n\n## Default governing law and forum\n\n- **English law with exclusive English jurisdiction** for company-side substantive contracts (employment, share options, licensing with UK partners, EALP quasi-equity, Subscription Agreement, Articles) [source: 11-Employment Contract Oliver Mason.md] [source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md] [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 02-161121 Whisk BBC GF.md] [source: 21-EALP Quasi-Equity Jan 2013 1.md] [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- **NDA family uses non-exclusive English jurisdiction** (which leaves room for proceedings elsewhere). When templating new NDAs, consider switching to exclusive jurisdiction unless there is a reason to keep optionality [source: 06-Mutual_NDA_Foodient_GreatBritishChefs.md] [source: 07-Mutual_NDA_Reciply_Foodity.md] [source: 14-Mutual_NDA_Foodient_DrJennyKabir.md] [source: 20-Mutual_NDA_Foodient_CallcreditInformationGroup_complete.md].\n- **McCormick is the outlier**: New York law, ICC arbitration seated in London (three arbitrators), NY Supreme/SDNY for non-arbitral proceedings, injunctive relief in any court [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- Two 2012 employment contracts (Powell, Hines) have **no express governing-law/jurisdiction clause** — implicit UK only. Add an explicit clause when reusing those templates.\n\n## Who signs what for Foodient\n\n- **Default counter-signatory**: Nick Holzherr (CEO/Director). Signed almost every commercial, licensing, NDA and employment document in the corpus.\n- **Craig Edmunds** signed at least one employment contract (Matthew Hines, Nov 2012) — only window where someone else signs for Foodient. Otherwise Holzherr is the single point of execution.\n- **Inference**: there is no second authorised signatory at scale. Where dual signature would normally be appropriate (deeds, large commitments, banking — bank mandate at Completion required two signatures over £2,000), expect to need a second director or an updated mandate before execution [source: 23-Whisk Sub Agreement - 12 June 2012.md]. Confirm authorised signatories before relying on Holzherr alone for new high-value commitments.\n- **Investor consent gate is wide**: under the Articles + Subscription Agreement, ~36 reserved matters require written consent of holders of a majority of \"A\" Ordinary Shares (EALP + BCC) — including new directors, share issues, share transfers, employee provisions, IP licensing outside the ordinary course, dividends, capex over £20k, salaries over £40k, borrowing over £30k, and unbudgeted spend over £20k. Internal sign-off is not enough for these items [source: 22-Foodient Ltd. - 2013-10-18 - Articles.md] [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n\n## Execution-status caution\n\n- **Almost every Markdown contract in the corpus has blank signature lines.** Treat signed-status as unverified. The only documents in the corpus that are clearly executed (signed) are:\n  - Allrecipes Licence Agreement (12 June 2014; both signatures with \"(signed)\" annotation on Allrecipes side, Whisk side just typed) [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Callcredit Marketing NDA (10 July 2012; both signature blocks marked \"(signed)\") [source: 20-Mutual_NDA_Foodient_CallcreditInformationGroup_complete.md].\n  - Whisk Subscription Agreement, executed as a deed by all parties on 12 June 2012 (founders, both Investors, Midven, all four Private Investors, witnessed) [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n  - The constitutional documents (Memorandum, Certificate of Incorporation, Articles, registry records) are by their nature authenticated rather than signed [source: 17-Foodient_certificate_of_incorporation.md] [source: 18-Foodient_memorandum_of_association.md] [source: 22-Foodient Ltd. - 2013-10-18 - Articles.md] [source: 19-UK TM scan.md] [source: 16-UK TM.md] [source: 10-EU TM.md].\n  - EALP Quasi-Equity Deed has the EALP/Millpoint side signed (D J M Kerr, witness Bay Murror) but the Foodient side is blank [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Deed-execution gap pattern**: deeds (Powell EMI, Herron EMI, Stojic consultancy, EALP quasi-equity, Loan Note Certificate template) repeatedly show blank witness fields and missing dates. When confirming any execution status, ask for a wet-ink/PDF original and the witness particulars, not just a Markdown copy.\n\n## Recurring drafting bugs to look for on review\n\nWhen reviewing or reusing any Foodient template, expect and check for:\n\n- **Square-bracket placeholders left in** the operative text (e.g. \"[one calendar month's]\", \"[full-time equivalent]\", \"[not]\", \"[Stuart Renshaw]\") [source: 13-Matthew Hines Employment Contract.md] [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Wrong numerical date references** (Mason employment \"first salary review prior to 1 January 2013\" pre-dates 1 Dec 2013 commencement; \"DATED 2012\"/\"DATED 2013\" with no day/month) [source: 11-Employment Contract Oliver Mason.md] [source: 04-Option Agreement template Claire Powell v2.md] [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Cross-reference drift after renumbering**: McCormick agreement refers to \"Section 9\" where it means Section 11 (confidentiality), and to \"Section 18(f)\" where it means 19(g) (assignment); Mason employment refers to \"this clause 14.2\" inside clause 15; Articles refers to \"Article 17.1.1 to 17.1.4\" inside Article 18 [source: 09-Collaboration Agreement Whisk & MKC FINAL.md] [source: 11-Employment Contract Oliver Mason.md] [source: 22-Foodient Ltd. - 2013-10-18 - Articles.md].\n- **Numbering jumps** (EALP quasi-equity goes from clause 3.1.12 to 3.1.14) [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Defined terms used but not defined**: McCormick uses \"Content Materials\" loosely; EALP quasi-equity uses \"EBITDA\" / \"Fund Manager\" / \"Subscription Agreement\" / \"BCC\" / \"Managers\" / \"Private Investors\" only by reference; Subscription Agreement uses \"Accounts\" / \"Accounts Date\" in warranty 6.1.3 without defining them [source: 02-161121 Whisk BBC GF.md] [source: 09-Collaboration Agreement Whisk & MKC FINAL.md] [source: 21-EALP Quasi-Equity Jan 2013 1.md] [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- **Mid-edit fragments**: BBC Good Food clause 4.1 ends \"(Platform Fees):\" with a trailing colon and no enumerated subclauses; Allrecipes Schedule 1 has a blank Language-of-Content cell for Argentina; the in-corpus \"Whisk Revenue Sharing – UK\" appendix is unnumbered and not expressly incorporated [source: 02-161121 Whisk BBC GF.md] [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Mis-numbered SSP sub-clauses** in the 2012 employment contracts (clause 7.3(a) nested under medical examination) [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Schedule text not reproduced**: EMI options reference Schedule 2 (Plan Rules) by incorporation but the Rules are not in the document, and the Rules prevail on inconsistency [source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md]; McCormick references Exhibit C (Convertible Note) and Exhibit F (Articles) by heading only [source: 09-Collaboration Agreement Whisk & MKC FINAL.md]; the Loan Note Certificate references \"the Instrument\" not present [source: 12-Loan Note Certificate FINAL.md].\n\n## Counterparty-type defaults\n\n- **Employees**: UK PAYE, England-and-Wales context. 28–32 days holiday inclusive of public holidays, 09:00–17:00 hours, monthly arrears salary, 1 month notice / 1 week per complete year (capped at 12 weeks) post-probation, 1 week probation notice, PILON at Company discretion, 1/260th day-rate for holiday pay-in-lieu and clawback. Suspend on full pay up to 2 weeks for investigation [source: 08-120712 Claire Powell Employment Contract.md] [source: 11-Employment Contract Oliver Mason.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Contractors**: independent-contractor framing, status indemnity, full IP assignment with moral-rights waiver, anti-bribery compliance flow-down, monthly invoicing, no liability cap, Bribery Act 2010 annual certification [source: 03-Consultancy agreement Milica Stojic.md].\n- **NDA counterparties**: Foodient's mutual-NDA template (used four times in 2012) has 5-year duration, 7-day return window, 10-day oral confirmation window, automatic-confidential treatment for customer lists / business plans / sales forecasts / financial info, back-to-back undertakings for \"Partners\", non-exclusive English jurisdiction. See `playbooks/confidentiality-nda.md`.\n- **Publishers / content licensors** (Allrecipes, BBC Good Food): widget/button integration, mutual or one-way IP indemnity (publisher indemnifies Whisk for Content infringement), 99.5% SLA framing, Schedule-driven revenue split or inverted Platform Fee, asymmetric Change-of-Control termination favouring publisher [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 02-161121 Whisk BBC GF.md].\n- **Strategic-investor partner** (McCormick): bundled services + financing + advertising-discount cost model + board observer, joint Representative decision-making, no jointly developed IP, hard fifth-anniversary sunset on advertising caps, NY law / ICC arbitration in London [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n\n## Liability-cap defaults\n\n- **Allrecipes**: £200,000 aggregate, with carve-outs for clause 11 IP indemnities and 10.1 non-excludables (death/PI, fraud, deliberate breach) [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **BBC Good Food**: aggregate cap = Platform Fees paid in the relevant Payment Term (tiny) — drafting note: clause 6.3 anchors to Platform Fees \"paid by Whisk to Licensor\", but Platform Fees actually flow Licensor-to-Whisk; possible drafting bug [source: 02-161121 Whisk BBC GF.md].\n- **McCormick**: standard exclusion of implied warranties and indirect/punitive/lost-profits damages [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Subscription Agreement**: Manager warranty cap **£35,000 each** (Schedule 2 Part 1); Company aggregate = investment + dividend arrears + enforcement costs; £1,000 de minimis / £20,000 basket; uncapped for fraud or wilful non-disclosure [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- **Stojic consultancy**: no liability cap; broad personal liability and indemnities on the Consultant [source: 03-Consultancy agreement Milica Stojic.md].\n- **Employment contracts**: no monetary cap (employment context); standard duty-and-deduction mechanics [source: 08-120712 Claire Powell Employment Contract.md] [source: 11-Employment Contract Oliver Mason.md] [source: 13-Matthew Hines Employment Contract.md].\n\n## Notice mechanics\n\n- Most contracts allow personal delivery, post (deemed received 48 hours / 7 days depending on template), courier and (sometimes) email/fax. The legacy NDA template (used four times in 2012) requires facsimile copy and does **not** specify email — modernise on reuse [source: 06-Mutual_NDA_Foodient_GreatBritishChefs.md] [source: 07-Mutual_NDA_Reciply_Foodity.md] [source: 14-Mutual_NDA_Foodient_DrJennyKabir.md] [source: 20-Mutual_NDA_Foodient_CallcreditInformationGroup_complete.md].\n- Mason employment contract **excludes email service entirely** — flag for any post-2013 reuse [source: 11-Employment Contract Oliver Mason.md].\n\n## Data protection posture and gaps\n\n- **Three categories of legacy DP drafting** in the corpus need uplift if reused:\n  - Allrecipes references Directive 95/46/EC and the E-Commerce Directive — pre-GDPR [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Stojic consultancy references the **Data Protection Act 1998** only and contains a **blanket consent to non-EEA personal data transfers** \"in order to further its business interests\" — broad and likely non-compliant under UK GDPR [source: 03-Consultancy agreement Milica Stojic.md].\n  - NDA template has no data protection clause at all; processing PII via Confidential Information channels would need a DPA in addition.\n- **No standalone DPA** is in the corpus despite McCormick contemplating Whisk processing PII for McCormick on instructions. Allrecipes and BBC Good Food are similarly DPA-light. Add a DPA on any reuse or renewal [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- For any contractor outside the UK/EEA (e.g. Stojic in Serbia), include UK IDTA / SCCs and a formal transfer impact assessment.\n\n## Investor / governance gates that constrain ordinary drafting\n\nThese are constitutional, so any contract decision should check whether one of them is engaged before signing:\n\n- \"A\" Ordinary majority (EALP + BCC) consent for the 36 reserved matters in Schedule 4 of the Subscription Agreement, and parallel Article-driven gates on share transfers, new issues, director appointments, director remuneration, conflicts and employee provisions [source: 22-Foodient Ltd. - 2013-10-18 - Articles.md] [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- 90% shareholder consent for any amendment to the Subscription Agreement, must include EALP and BCC [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- Trigger Date 31 May 2019 has passed — EALP/BCC may force Appointee/drag-along sale at any time [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- ERDF-driven hard covenants: registered office must remain in the West Midlands (currently Birmingham — compliant); no Restricted Activities — see the \"online retail\" tension noted in `MEMORY.md` [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- McCormick agreement (if live) restricts integration of third-party flavor-profile recommendation tech and requires McCormick's written consent for any Whisk assignment [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n\n## Hard cutoffs to remember (cross-cutting)\n\n- **30-day EMI Notice / deed-signing window**: an EMI option lapses automatically if not signed as a deed and EMI Notice not returned within 30 days of Date of Grant [source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md].\n- **6-month / 5-year warranty windows**: Manager warranty claims under the Subscription Agreement must be notified within 6 months after the end of the first full accounting reference period after Completion (clause 6.8); Foodient's mutual NDA template has a 5-year obligation duration [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- **30-day cure** for material breach in McCormick; **10-day cure** in Allrecipes; **14-day non-payment** is a default trigger in EALP quasi-equity [source: 09-Collaboration Agreement Whisk & MKC FINAL.md] [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Tradition of asymmetric Change-of-Control termination against Whisk** — Allrecipes and McCormick both have it; Whisk's negotiating template should resist this in future deals [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n",
    "sources": []
  },
  "health": {
    "tier": "Needs attention",
    "tone": "warning",
    "why": "EU and UK trade mark renewals are years overdue; BBC liability cap may equal zero as drafted",
    "coverage": 57,
    "coverageWhy": "Missing DPA, current org chart, and IP assignments for Powell/Hines"
  },
  "recent": [
    {
      "id": "03-consultancy-agreement-milica-stojic",
      "file": "03-Consultancy agreement Milica Stojic.md",
      "name": "Consultancy Agreement (executed as a deed)",
      "status": "Needs attention",
      "statusColor": "red",
      "when": "2018"
    },
    {
      "id": "02-161121-whisk-bbc-gf",
      "file": "02-161121 Whisk BBC GF.md",
      "name": "Whisk Publisher Agreement (Widget licence)",
      "status": "Needs attention",
      "statusColor": "red",
      "when": "2016"
    },
    {
      "id": "01-allrecipes-contract-final-2014-06-12",
      "file": "01-Allrecipes Contract - FINAL 2014-06-12.md",
      "name": "Licence Agreement (Widget integration and content licence)",
      "status": "Executed",
      "statusColor": "green",
      "when": "2014"
    }
  ],
  "notifications": {
    "items": [
      {
        "name": "Verify Whisk EU CTM (No. 011348001) renewal status",
        "when": "1274d overdue",
        "urgency": "red",
        "relatedDocument": "10-EU TM.md",
        "relatedParty": "Forresters"
      },
      {
        "name": "Verify Whisk UK TM (No. 2621130) renewal status",
        "when": "1457d overdue",
        "urgency": "red",
        "relatedDocument": "19-UK TM scan.md",
        "relatedParty": "Forresters"
      },
      {
        "name": "McCormick Collaboration — fifth-anniversary hard sunset",
        "when": "2019-XX-XX",
        "urgency": "muted",
        "relatedDocument": "09-Collaboration Agreement Whisk & MKC FINAL.md",
        "relatedParty": "McCormick & Company, Inc."
      },
      {
        "name": "McCormick Collaboration — annual renewal trigger",
        "when": "recurrence:",
        "urgency": "muted",
        "relatedDocument": "09-Collaboration Agreement Whisk & MKC FINAL.md",
        "relatedParty": "McCormick & Company, Inc."
      },
      {
        "name": "Allrecipes Licence — rolling 6-month termination notice window",
        "when": "3804d overdue",
        "urgency": "red",
        "relatedDocument": "01-Allrecipes Contract - FINAL 2014-06-12.md",
        "relatedParty": "Allrecipes.com, Inc."
      },
      {
        "name": "Allrecipes Licence — perpetual deemed Shared Data licence trigger",
        "when": "type:",
        "urgency": "muted",
        "relatedDocument": "01-Allrecipes Contract - FINAL 2014-06-12.md",
        "relatedParty": "Allrecipes.com, Inc."
      }
    ]
  },
  "missing": {
    "items": [
      {
        "name": "Data Processing Agreement (DPA)",
        "sub": "Required by GDPR; Stojic consultancy processes personal data",
        "files": [
          "03-Consultancy agreement Milica Stojic.md",
          "01-Allrecipes Contract - FINAL 2014-06-12.md"
        ],
        "contacts": [
          "milica-stojic"
        ],
        "prompt": "Please draft \"Data Processing Agreement (DPA)\" for me.\n\nWhy we need it: Required by GDPR; Stojic consultancy processes personal data"
      },
      {
        "name": "Modern privacy policy (post-GDPR)",
        "sub": "Corpus references DPA 1998 only — pre-GDPR",
        "files": [
          "03-Consultancy agreement Milica Stojic.md",
          "01-Allrecipes Contract - FINAL 2014-06-12.md"
        ],
        "contacts": [],
        "prompt": "Please draft \"Modern privacy policy (post-GDPR)\" for me.\n\nWhy we need it: Corpus references DPA 1998 only — pre-GDPR"
      },
      {
        "name": "McCormick Strategic Collaboration",
        "sub": "Active commercial partnership; cap-table impact",
        "files": [],
        "contacts": [],
        "prompt": "Please draft \"McCormick Strategic Collaboration\" for me.\n\nWhy we need it: Active commercial partnership; cap-table impact"
      },
      {
        "name": "IP assignment — Claire Powell",
        "sub": "2012 employment template predates IP clause introduced in Mason 2013",
        "files": [],
        "contacts": [],
        "prompt": "Please draft \"IP assignment — Claire Powell\" for me.\n\nWhy we need it: 2012 employment template predates IP clause introduced in Mason 2013"
      },
      {
        "name": "IP assignment — Tom Hines",
        "sub": "2012 employment template predates IP clause introduced in Mason 2013",
        "files": [],
        "contacts": [],
        "prompt": "Please draft \"IP assignment — Tom Hines\" for me.\n\nWhy we need it: 2012 employment template predates IP clause introduced in Mason 2013"
      },
      {
        "name": "Loan Note Instrument (full body)",
        "sub": "Only blank certificate on file in corpus",
        "files": [],
        "contacts": [],
        "prompt": "Please draft \"Loan Note Instrument (full body)\" for me.\n\nWhy we need it: Only blank certificate on file in corpus"
      }
    ]
  },
  "suggested": {
    "items": [
      {
        "name": "Reconcile capital structure",
        "sub": "McCormick warrants 1,520,201 vs SubAgr 1,418,797",
        "tag": "Conflict",
        "tagColor": "amber",
        "action": "Reconcile",
        "files": [
          "09-Collaboration Agreement Whisk & MKC FINAL.md",
          "23-Whisk Sub Agreement - 12 June 2012.md"
        ],
        "contacts": [
          "mccormick-and-company",
          "early-advantage-limited-partnership"
        ],
        "prompt": "The McCormick warrant covers 1,520,201 shares but the EALP Subscription Agreement\nreferences 1,418,797. Reconcile these against the share register. Tell me which\nfigure is canonical, what amendment is needed, and which counterparties I have to\nnotify before the next investor update.\n"
      },
      {
        "name": "BBC liability cap drafting bug",
        "sub": "Cap = \"Platform Fees paid by Whisk\" — may equal zero (clause 6.3)",
        "tag": "Risk",
        "tagColor": "red",
        "action": "Review",
        "files": [
          "02-161121 Whisk BBC GF.md"
        ],
        "contacts": [
          "bbc-worldwide-limited"
        ],
        "prompt": "BBC Good Food Publisher Agreement clause 6.3 caps liability at \"Platform Fees paid\nby Whisk\" — which is zero in the current commercial structure. Review the clause\nand propose redline language that fixes the cap at a reasonable floor (e.g. £100k\nor 12 months' fees) without re-opening the whole agreement.\n"
      },
      {
        "name": "Resolve registered office mismatch",
        "sub": "Faraday Wharf vs Cornwall House — verify before notices",
        "tag": "Conflict",
        "tagColor": "amber",
        "action": "Resolve",
        "files": [
          "06-Mutual_NDA_Foodient_GreatBritishChefs.md"
        ],
        "contacts": [
          "early-advantage-limited-partnership"
        ],
        "prompt": "Counterparty correspondence still uses Faraday Wharf as our registered office, but\nwe moved to Cornwall House in 2018. Tell me which active agreements have stale\nnotice addresses, and draft a notice-of-address-change letter I can send to each\ncounterparty before serving any contractual notices.\n"
      }
    ]
  },
  "parties": {
    "summary": "22 total · top 3 by file count",
    "items": [
      {
        "initials": "NH",
        "avatarBg": "#CECBF6",
        "avatarColor": "#26215C",
        "name": "Nick Holzherr",
        "tag": "Counterparty",
        "tagColor": "grey",
        "docs": []
      },
      {
        "initials": "OM",
        "avatarBg": "#9FE1CB",
        "avatarColor": "#04342C",
        "name": "Oliver Mason",
        "tag": "Counterparty",
        "tagColor": "grey",
        "docs": []
      },
      {
        "initials": "CE",
        "avatarBg": "#F5C4B3",
        "avatarColor": "#4A1B0C",
        "name": "Craig Edmunds",
        "tag": "Counterparty",
        "tagColor": "grey",
        "docs": []
      }
    ]
  },
  "categories": {
    "summary": "23 contracts in 12 categories",
    "items": [
      {
        "id": "confidentiality-non-disclosure-agreements",
        "icon": "ti-shield-check",
        "name": "Confidentiality & Non-Disclosure Agreements",
        "count": 4,
        "body": "",
        "sources": [
          "06-Mutual_NDA_Foodient_GreatBritishChefs.md",
          "07-Mutual_NDA_Reciply_Foodity.md",
          "14-Mutual_NDA_Foodient_DrJennyKabir.md",
          "20-Mutual_NDA_Foodient_CallcreditInformationGroup_complete.md"
        ],
        "playbooks": []
      },
      {
        "id": "employment-contracts",
        "icon": "ti-user-check",
        "name": "Employment Contracts",
        "count": 3,
        "body": "# Employment Contracts Playbook\n\nThree UK PAYE employment contracts in corpus: Powell (2012, Marketing Assistant), Hines (2012, Junior Developer), Mason (2013, Senior Developer). All three for Foodient Limited, all with blank signature lines in the Markdown copies.\n\n## Recurring Foodient employment posture\n\n- **UK PAYE, England-and-Wales context**. Mason expressly chooses England and Wales law / exclusive English jurisdiction (clause 25); Powell and Hines have no express governing-law/jurisdiction clause — implicit UK only [source: 11-Employment Contract Oliver Mason.md] [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Probation 3 months default + up to 3 months extension** (Powell, Hines); **6 months** (Mason). 1 week's notice during probation in all three [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md] [source: 11-Employment Contract Oliver Mason.md].\n- **Post-probation notice**: 1 calendar month for years 1-5; then 1 week per complete year, capped at 12 weeks (Powell, Hines, Mason — though Mason's restrictive-covenant clauses pull from this baseline rather than restating it).\n- **PILON at Company discretion**: basic salary only; Mason adds an explicit mitigation set-off (instalments reduced by alternative income) [source: 11-Employment Contract Oliver Mason.md].\n- **Holiday year**: 1 January – 31 December; 28 days inclusive of public holidays for Powell and Hines, 32 days for Mason; pay-in-lieu and clawback computed at 1/260th of salary per day. Statutory floor preserved on misconduct dismissal/short-notice resignation [source: 08-120712 Claire Powell Employment Contract.md] [source: 11-Employment Contract Oliver Mason.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Hours**: 09:00–17:00 Mon-Fri with 1-hour lunch; reasonable additional hours unpaid [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Place of work**: Birmingham (Faraday Wharf / Aston Science Park / Tech Tropicana 8 Venture Way at different times) with up to 1 month overseas travel allowed.\n- **Sickness**: notify by 10:00 day 1 (to Head of Marketing or Co-Founder for Powell; Executive Assistant for Hines); doctor's certificate from day 7; consent to medical exam at Company expense; SSP qualifying days Mon-Fri.\n- **Pension**: stakeholder access only, no employer contributions (predates auto-enrolment in all three). Hines clause 10.2 retains \"[not]\" in brackets for the contracting-out certificate — ambiguous on its face.\n- **Suspension on full pay up to 2 weeks** for misconduct/neglect investigation (all three).\n- **Confidentiality**: indefinite duty post-termination, with carve-outs for ERA 1996 s.43A protected disclosures and authorised/legally required disclosure (all three).\n- **Right to deduct sums owed** from salary or other payments, including over-taken holiday and (Mason) third-party damages relating to lost earnings during Incapacity capped at sums paid by Company.\n- **Third-party rights expressly excluded** (all three).\n- **Reservation of right to make reasonable unilateral changes** with written notice (Powell, Hines).\n\n## Variations by contract\n\n| Term | Powell (2012) | Hines (2012) | Mason (2013) |\n|---|---|---|---|\n| Salary | £14,500 | £12,000 | £35,000 |\n| Probation | 3m + 3m | 3m + 3m | 6 months |\n| Holiday | 28 days incl. PH | 28 days incl. PH | 32 days incl. PH |\n| Restrictive covenants | None | None | 12m non-solicit/poach + 6m non-compete + 6m no-dealings; cascade-poaching; garden leave reduces; mirror covenants on request [source: 11-Employment Contract Oliver Mason.md] |\n| IP assignment | None | None (just company-property language) | Not addressed; relies on company-property language (clause 4.5) |\n| Express governing law / forum | No | No | Yes — England and Wales, exclusive |\n| Notice mechanic | Standard | Standard | **Excludes email service** (clause 20.4) |\n| Summary-dismissal Incapacity threshold | n/a | n/a | 16-week aggregate in 52 weeks |\n| Anti-bribery clause | No | No | Yes (clause 4.3); ERA 1996 e-comms monitoring consent (clause 4.2) |\n| Signed for Foodient by | Nick Holzherr | **Craig Edmunds** | Nick Holzherr |\n\n## Drafting bugs to fix on reuse\n\n- **Hines and Powell**: clause 7.3(a) (SSP) is mis-numbered as a sub-paragraph of the medical-examination clause [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Powell**: clause 7.2 references \"HR Manager of a Co-Founder\" — typo for \"or\" [source: 08-120712 Claire Powell Employment Contract.md].\n- **Hines**: clause 8.1(a) retains square brackets around \"[one calendar month's]\"; clause 6.3 has unmatched bracket and bracketed \"[full-time equivalent]\"; clause 10.2 retains \"[not]\" in brackets; clause 8.3(a) ambiguous [source: 13-Matthew Hines Employment Contract.md].\n- **Mason**: salary review \"first such review to take place prior to 1st January 2013\" pre-dates the 1 December 2013 Commencement Date — likely intended 1 January 2014; clauses 15.3, 15.5, 15.7, 15.8, 15.9 say \"this clause 14.2\" but should refer to clause 15; stray closing brackets at end of clauses 9.7, 13.1.5 and 14.1.1; clause 21.1 unbalanced brackets [source: 11-Employment Contract Oliver Mason.md].\n- **Mason**: clause 7.1 says salary is inclusive of director/officer fees — implies the Employee may also be appointed an officer, but no other clause confirms this. Worth resolving on review.\n\n## Hard cutoffs and mechanics specific to Foodient employment\n\n- **Notice scaling trigger**: after 5 complete years of continuous employment, notice steps up to 1 week per complete year, capped at 12 weeks (all three) [source: 08-120712 Claire Powell Employment Contract.md].\n- **Powell 5-year trigger**: from ~25 June 2017 (passed) [source: 08-120712 Claire Powell Employment Contract.md].\n- **Mason restrictive covenants**: 12m non-solicit and non-poach, 6m non-compete, 6m no-dealings post-Termination, with garden leave reducing the period and cascade-poaching extending it [source: 11-Employment Contract Oliver Mason.md].\n\n## Reusable points if drafting a new Foodient employment contract today\n\n- **Modernise the pension clause** to reflect auto-enrolment.\n- **Add an express IP assignment / inventions clause** for technical and creative roles. The current templates rely on company-property wording only, which is weak for inventions.\n- **Add a UK GDPR / DPA 2018 clause** with monitoring/data-handling consents.\n- **Add post-termination restrictive covenants** for any role with access to roadmaps, source code, customer lists or pricing — Powell (BD-adjacent) and Hines (developer) had none.\n- **Use Mason's restrictive-covenant package as the base template**, but renumber correctly (current cross-refs say \"clause 14.2\" inside clause 15) and re-add email service to the notices clause.\n- **Standardise on England-and-Wales exclusive jurisdiction** in the express governing-law clause (Powell and Hines lack one; Mason has the right form).\n- **Confirm authorised signatory**: the only corpus instance of someone other than Holzherr signing employment was Craig Edmunds (Hines, Nov 2012). Default is Holzherr today.\n",
        "sources": [],
        "playbooks": [
          {
            "id": "employment-contracts",
            "title": "employment contracts",
            "body": "# Employment Contracts Playbook\n\nThree UK PAYE employment contracts in corpus: Powell (2012, Marketing Assistant), Hines (2012, Junior Developer), Mason (2013, Senior Developer). All three for Foodient Limited, all with blank signature lines in the Markdown copies.\n\n## Recurring Foodient employment posture\n\n- **UK PAYE, England-and-Wales context**. Mason expressly chooses England and Wales law / exclusive English jurisdiction (clause 25); Powell and Hines have no express governing-law/jurisdiction clause — implicit UK only [source: 11-Employment Contract Oliver Mason.md] [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Probation 3 months default + up to 3 months extension** (Powell, Hines); **6 months** (Mason). 1 week's notice during probation in all three [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md] [source: 11-Employment Contract Oliver Mason.md].\n- **Post-probation notice**: 1 calendar month for years 1-5; then 1 week per complete year, capped at 12 weeks (Powell, Hines, Mason — though Mason's restrictive-covenant clauses pull from this baseline rather than restating it).\n- **PILON at Company discretion**: basic salary only; Mason adds an explicit mitigation set-off (instalments reduced by alternative income) [source: 11-Employment Contract Oliver Mason.md].\n- **Holiday year**: 1 January – 31 December; 28 days inclusive of public holidays for Powell and Hines, 32 days for Mason; pay-in-lieu and clawback computed at 1/260th of salary per day. Statutory floor preserved on misconduct dismissal/short-notice resignation [source: 08-120712 Claire Powell Employment Contract.md] [source: 11-Employment Contract Oliver Mason.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Hours**: 09:00–17:00 Mon-Fri with 1-hour lunch; reasonable additional hours unpaid [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Place of work**: Birmingham (Faraday Wharf / Aston Science Park / Tech Tropicana 8 Venture Way at different times) with up to 1 month overseas travel allowed.\n- **Sickness**: notify by 10:00 day 1 (to Head of Marketing or Co-Founder for Powell; Executive Assistant for Hines); doctor's certificate from day 7; consent to medical exam at Company expense; SSP qualifying days Mon-Fri.\n- **Pension**: stakeholder access only, no employer contributions (predates auto-enrolment in all three). Hines clause 10.2 retains \"[not]\" in brackets for the contracting-out certificate — ambiguous on its face.\n- **Suspension on full pay up to 2 weeks** for misconduct/neglect investigation (all three).\n- **Confidentiality**: indefinite duty post-termination, with carve-outs for ERA 1996 s.43A protected disclosures and authorised/legally required disclosure (all three).\n- **Right to deduct sums owed** from salary or other payments, including over-taken holiday and (Mason) third-party damages relating to lost earnings during Incapacity capped at sums paid by Company.\n- **Third-party rights expressly excluded** (all three).\n- **Reservation of right to make reasonable unilateral changes** with written notice (Powell, Hines).\n\n## Variations by contract\n\n| Term | Powell (2012) | Hines (2012) | Mason (2013) |\n|---|---|---|---|\n| Salary | £14,500 | £12,000 | £35,000 |\n| Probation | 3m + 3m | 3m + 3m | 6 months |\n| Holiday | 28 days incl. PH | 28 days incl. PH | 32 days incl. PH |\n| Restrictive covenants | None | None | 12m non-solicit/poach + 6m non-compete + 6m no-dealings; cascade-poaching; garden leave reduces; mirror covenants on request [source: 11-Employment Contract Oliver Mason.md] |\n| IP assignment | None | None (just company-property language) | Not addressed; relies on company-property language (clause 4.5) |\n| Express governing law / forum | No | No | Yes — England and Wales, exclusive |\n| Notice mechanic | Standard | Standard | **Excludes email service** (clause 20.4) |\n| Summary-dismissal Incapacity threshold | n/a | n/a | 16-week aggregate in 52 weeks |\n| Anti-bribery clause | No | No | Yes (clause 4.3); ERA 1996 e-comms monitoring consent (clause 4.2) |\n| Signed for Foodient by | Nick Holzherr | **Craig Edmunds** | Nick Holzherr |\n\n## Drafting bugs to fix on reuse\n\n- **Hines and Powell**: clause 7.3(a) (SSP) is mis-numbered as a sub-paragraph of the medical-examination clause [source: 08-120712 Claire Powell Employment Contract.md] [source: 13-Matthew Hines Employment Contract.md].\n- **Powell**: clause 7.2 references \"HR Manager of a Co-Founder\" — typo for \"or\" [source: 08-120712 Claire Powell Employment Contract.md].\n- **Hines**: clause 8.1(a) retains square brackets around \"[one calendar month's]\"; clause 6.3 has unmatched bracket and bracketed \"[full-time equivalent]\"; clause 10.2 retains \"[not]\" in brackets; clause 8.3(a) ambiguous [source: 13-Matthew Hines Employment Contract.md].\n- **Mason**: salary review \"first such review to take place prior to 1st January 2013\" pre-dates the 1 December 2013 Commencement Date — likely intended 1 January 2014; clauses 15.3, 15.5, 15.7, 15.8, 15.9 say \"this clause 14.2\" but should refer to clause 15; stray closing brackets at end of clauses 9.7, 13.1.5 and 14.1.1; clause 21.1 unbalanced brackets [source: 11-Employment Contract Oliver Mason.md].\n- **Mason**: clause 7.1 says salary is inclusive of director/officer fees — implies the Employee may also be appointed an officer, but no other clause confirms this. Worth resolving on review.\n\n## Hard cutoffs and mechanics specific to Foodient employment\n\n- **Notice scaling trigger**: after 5 complete years of continuous employment, notice steps up to 1 week per complete year, capped at 12 weeks (all three) [source: 08-120712 Claire Powell Employment Contract.md].\n- **Powell 5-year trigger**: from ~25 June 2017 (passed) [source: 08-120712 Claire Powell Employment Contract.md].\n- **Mason restrictive covenants**: 12m non-solicit and non-poach, 6m non-compete, 6m no-dealings post-Termination, with garden leave reducing the period and cascade-poaching extending it [source: 11-Employment Contract Oliver Mason.md].\n\n## Reusable points if drafting a new Foodient employment contract today\n\n- **Modernise the pension clause** to reflect auto-enrolment.\n- **Add an express IP assignment / inventions clause** for technical and creative roles. The current templates rely on company-property wording only, which is weak for inventions.\n- **Add a UK GDPR / DPA 2018 clause** with monitoring/data-handling consents.\n- **Add post-termination restrictive covenants** for any role with access to roadmaps, source code, customer lists or pricing — Powell (BD-adjacent) and Hines (developer) had none.\n- **Use Mason's restrictive-covenant package as the base template**, but renumber correctly (current cross-refs say \"clause 14.2\" inside clause 15) and re-add email service to the notices clause.\n- **Standardise on England-and-Wales exclusive jurisdiction** in the express governing-law clause (Powell and Hines lack one; Mason has the right form).\n- **Confirm authorised signatory**: the only corpus instance of someone other than Holzherr signing employment was Craig Edmunds (Hines, Nov 2012). Default is Holzherr today.\n",
            "sources": [],
            "categories": []
          }
        ]
      },
      {
        "id": "trade-marks",
        "icon": "ti-tag",
        "name": "Trade Marks",
        "count": 3,
        "body": "# Trade Marks Playbook\n\nThree trade-mark records in corpus, all for the **\"Whisk\"** word mark held by Foodient Ltd: a UK national mark and the equivalent EU/CTM record (two extracts).\n\n## \"Whisk\" trade mark portfolio\n\n- **UK Trade Mark \"Whisk\"** No. **2621130** — registered 16 May 2012 (Trade Marks Act 1994); Classes 16, 35, 41, 42 [source: 19-UK TM scan.md]. Note: the supplied UK certificate Markdown does not name the proprietor entity — confirm proprietor of record on the IPO register before relying on ownership.\n- **EU CTM/EUTM \"Whisk\"** No. **011348001** (EUIPO/OHIM application 011348001; receiving office number E62837574; applicant identifier 543491) — filed 15 Nov 2012 with **UK priority from 16 May 2012** (GB 2621130, accepted, not partial); registered 18 Apr 2013; Classes 9, 35, 41, 42, 43; expiry 15 Nov 2022 [source: 10-EU TM.md] [source: 16-UK TM.md].\n- **Acquired distinctiveness: false** — registration relied on inherent distinctiveness of \"Whisk\" for the listed goods/services; potential vulnerability to descriptiveness/non-distinctiveness challenges in the cookery field [source: 10-EU TM.md].\n- **Representative**: Forresters (Birmingham IP firm; OHIMCOMMSBIRMINGHAM@forresters.co.uk; +44 121 236 0484; Rutland House, 148 Edmund Street, Birmingham B3 2JA). See `contacts/forresters.md`.\n\n## Renewal / status risk (high priority)\n\n- **Both UK and EU \"Whisk\" registrations show expiry 15 November 2022 with no renewal recorded in the extracts**. Treat current legal-rights status as **unverified** [source: 10-EU TM.md] [source: 16-UK TM.md] [source: 19-UK TM scan.md].\n- **EUTM renewals** can be filed up to 6 months after expiry with a surcharge — this window is closed as of today.\n- **Post-Brexit comparable UK rights**: not addressed in the extracts; verify the comparable-UK-mark position via UK IPO records.\n- Specification text contains OCR artifacts (double semicolons, soft hyphens) — rely on the original EUIPO record for any formal use.\n\n## Reusable filing posture\n\n- **Word mark, Individual** for \"Whisk\" filed in:\n  - UK Classes: 16, 35, 41, 42.\n  - EU Classes: 9, 35, 41, 42, 43 (broader EU scope including Class 9 for software/apps and Class 43 for catering).\n- **Specifications anchor** consistently to the themes \"cookery, cooking, recipes, ingredients, food shopping, reduction of food wastage, online retail and advertising\" — a reusable goods/services formula for related filings [source: 10-EU TM.md].\n- **UK priority claim** (GB 2621130, priority date 2012-05-16, accepted) demonstrates use of a 6-month Paris Convention priority window from a UK national filing — useful pattern when extending the brand into further jurisdictions [source: 10-EU TM.md] [source: 16-UK TM.md].\n\n## Maintenance obligations\n\n- **Genuine use** in the EU within 5 years of registration (in the registered classes), and in the UK to avoid non-use revocation in any 5-year period.\n- **Renewal** every 10 years (next at 15 Nov 2032 if reinstated/renewed today).\n- **Recordal of changes of name/address** (a Forresters change-of-name/address recordal is logged on 2013-04-29 — pattern to copy if Foodient/Forresters details change).\n\n## Reusable points for any new TM filing for Whisk-branded products\n\n- **Check existing class coverage first** — Classes 9, 35, 41, 42, 43 (EU) and 16, 35, 41, 42 (UK) already cover most cookery / online-retail / SaaS / catering activities. Filing should be targeted at gaps.\n- **Use Forresters** as the natural filing route — they hold the existing portfolio.\n- **Be alert to descriptiveness challenges**: \"Whisk\" was registered without acquired distinctiveness in the cookery field; future filings in cooking/baking-adjacent classes are vulnerable to opposition. Pair with brand-evidence packages where possible.\n- **Use UK priority** (Paris Convention, 6-month window) when extending a UK national filing to EU/EUIPO (and from there to international filings via the Madrid Protocol).\n",
        "sources": [],
        "playbooks": [
          {
            "id": "trade-marks",
            "title": "trade marks",
            "body": "# Trade Marks Playbook\n\nThree trade-mark records in corpus, all for the **\"Whisk\"** word mark held by Foodient Ltd: a UK national mark and the equivalent EU/CTM record (two extracts).\n\n## \"Whisk\" trade mark portfolio\n\n- **UK Trade Mark \"Whisk\"** No. **2621130** — registered 16 May 2012 (Trade Marks Act 1994); Classes 16, 35, 41, 42 [source: 19-UK TM scan.md]. Note: the supplied UK certificate Markdown does not name the proprietor entity — confirm proprietor of record on the IPO register before relying on ownership.\n- **EU CTM/EUTM \"Whisk\"** No. **011348001** (EUIPO/OHIM application 011348001; receiving office number E62837574; applicant identifier 543491) — filed 15 Nov 2012 with **UK priority from 16 May 2012** (GB 2621130, accepted, not partial); registered 18 Apr 2013; Classes 9, 35, 41, 42, 43; expiry 15 Nov 2022 [source: 10-EU TM.md] [source: 16-UK TM.md].\n- **Acquired distinctiveness: false** — registration relied on inherent distinctiveness of \"Whisk\" for the listed goods/services; potential vulnerability to descriptiveness/non-distinctiveness challenges in the cookery field [source: 10-EU TM.md].\n- **Representative**: Forresters (Birmingham IP firm; OHIMCOMMSBIRMINGHAM@forresters.co.uk; +44 121 236 0484; Rutland House, 148 Edmund Street, Birmingham B3 2JA). See `contacts/forresters.md`.\n\n## Renewal / status risk (high priority)\n\n- **Both UK and EU \"Whisk\" registrations show expiry 15 November 2022 with no renewal recorded in the extracts**. Treat current legal-rights status as **unverified** [source: 10-EU TM.md] [source: 16-UK TM.md] [source: 19-UK TM scan.md].\n- **EUTM renewals** can be filed up to 6 months after expiry with a surcharge — this window is closed as of today.\n- **Post-Brexit comparable UK rights**: not addressed in the extracts; verify the comparable-UK-mark position via UK IPO records.\n- Specification text contains OCR artifacts (double semicolons, soft hyphens) — rely on the original EUIPO record for any formal use.\n\n## Reusable filing posture\n\n- **Word mark, Individual** for \"Whisk\" filed in:\n  - UK Classes: 16, 35, 41, 42.\n  - EU Classes: 9, 35, 41, 42, 43 (broader EU scope including Class 9 for software/apps and Class 43 for catering).\n- **Specifications anchor** consistently to the themes \"cookery, cooking, recipes, ingredients, food shopping, reduction of food wastage, online retail and advertising\" — a reusable goods/services formula for related filings [source: 10-EU TM.md].\n- **UK priority claim** (GB 2621130, priority date 2012-05-16, accepted) demonstrates use of a 6-month Paris Convention priority window from a UK national filing — useful pattern when extending the brand into further jurisdictions [source: 10-EU TM.md] [source: 16-UK TM.md].\n\n## Maintenance obligations\n\n- **Genuine use** in the EU within 5 years of registration (in the registered classes), and in the UK to avoid non-use revocation in any 5-year period.\n- **Renewal** every 10 years (next at 15 Nov 2032 if reinstated/renewed today).\n- **Recordal of changes of name/address** (a Forresters change-of-name/address recordal is logged on 2013-04-29 — pattern to copy if Foodient/Forresters details change).\n\n## Reusable points for any new TM filing for Whisk-branded products\n\n- **Check existing class coverage first** — Classes 9, 35, 41, 42, 43 (EU) and 16, 35, 41, 42 (UK) already cover most cookery / online-retail / SaaS / catering activities. Filing should be targeted at gaps.\n- **Use Forresters** as the natural filing route — they hold the existing portfolio.\n- **Be alert to descriptiveness challenges**: \"Whisk\" was registered without acquired distinctiveness in the cookery field; future filings in cooking/baking-adjacent classes are vulnerable to opposition. Pair with brand-evidence packages where possible.\n- **Use UK priority** (Paris Convention, 6-month window) when extending a UK national filing to EU/EUIPO (and from there to international filings via the Madrid Protocol).\n",
            "sources": [],
            "categories": []
          }
        ]
      },
      {
        "id": "intellectual-property-licensing",
        "icon": "ti-license",
        "name": "Intellectual Property Licensing",
        "count": 2,
        "body": "# Intellectual Property Licensing Playbook (Publisher / Widget licences)\n\nTwo executed-or-near-executed publisher Widget licences in corpus: Allrecipes (executed 12 June 2014) and BBC Good Food (effective 1 December 2016, signature blocks blank in copy). Whisk integrates the Widget/Button into the partner's recipe pages and exposes Shared Data via API.\n\n## Common posture\n\n- **Whisk owns Platform, User Data and Marks**; partner owns Content and Sites [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 02-161121 Whisk BBC GF.md].\n- **English law, exclusive English courts** [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 02-161121 Whisk BBC GF.md].\n- **99.5% availability SLA** framing (Allrecipes) — if matching this in future, scope the SLA measurement clearly: Allrecipes ties it to \"browsers used by ≥10% of Site users monthly\", with failure across \"any 3 consecutive months\" giving the licensor a termination right (a phrasing that is itself ambiguous between rolling and quarterly windows) [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Asymmetric Change-of-Control termination** in favour of the publisher in both deals. Push back on this structurally — Whisk's negotiating template should not concede unilateral CoC termination by default [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 02-161121 Whisk BBC GF.md].\n- **Mutual IP indemnities** with notice-and-control conditions (Allrecipes 11.4-11.7); one-way licensor IP indemnity for Content (BBC Good Food 7.4) — the licensor-side indemnity is what to push for in any new publisher licence.\n- **Mutual confidentiality**, with carve-outs for public domain / prior possession / third-party / independent development / legal compulsion.\n- **Term Sheet at front** of agreement carrying operative commercial terms (BBC Good Food template) — useful organising pattern.\n\n## Two distinct commercial models\n\n| | Allrecipes 2014 | BBC Good Food 2016 |\n|---|---|---|\n| Cash flow | Whisk shares Retailer/Brand Revenue with Allrecipes; settled within 60 days of each calendar-month Payment Term, in GBP | **BBC Good Food pays Whisk £2,000/month Platform Fee**; BBC Good Food retains 100% affiliate revenue; reporting within 45 days, 30-day pay |\n| Initial Term | 18 months from 2014-06-12 | 12 months from 2016-12-01 |\n| Termination notice (post-Initial) | 6 months | 3 months |\n| Break right | None at start; either party can terminate for material breach (10-day cure) | **Licensor can break c. 1 March 2017** if (a) Platform inaccessible >10% via Button; (b) >5% Users complain in writing; (c) Licensor loses third-party advertising revenue exceeding Revenue Fees as a direct result of the licence |\n| Liability cap | £200,000 aggregate; carve-outs for clause 11 IP indemnities and 10.1 non-excludables | Aggregate cap = Platform Fees in relevant Payment Term (drafting bug — clause 6.3 says Platform Fees \"paid by Whisk to Licensor\" but the flow is the other way) |\n| Exclusivity | Per-Site flag in Schedule 1, with named carve-out (Lakeland Limited) | Licensor undertakes not to integrate any new shopping-list/e-commerce-interoperability feature equivalent to the Widget integration during the term (clause 3.6) |\n| Force Majeure | 90-day termination right (both deals) | Same |\n| Wind-down | 6 months on termination notice; Licensor non-replacement only where Licensor-initiated termination or commercial unviability | Not specified |\n\n## Reusable mechanics worth pulling into new publisher deals\n\n- **Country-by-country revenue split via signed Addendums** (Allrecipes clause 7.1) — useful template for staged rollouts where pricing is jurisdiction-specific [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Schedule 1 \"exclusive\" flag per site with named carve-out** for pre-existing relationships (Allrecipes / Lakeland) [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Audit right with 10% underpayment cost-shift** (Allrecipes 7.7); underpaid amounts due within 45 days of audit; clause survives termination [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Shared Data future-licence mechanism** — restrictions for 3 years post-termination, after which Whisk is **deemed to grant** Licensor a perpetual, irrevocable, non-exclusive, sub-licensable, transferable licence to the Shared Data as it stood on termination notice date (Allrecipes 5.1-5.3). Useful precedent for converting a temporary data-sharing arrangement into a long-tail commercial outcome — but the deemed perpetual licence is **a hard cutoff against Whisk** that future negotiators should be aware of [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **API availability post-termination cap**: API remains accessible no longer than **24 hours after termination notice**; no obligation to push new/updated Shared Data thereafter [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Reporting cadence template** (Schedule 6, Allrecipes, PST timezone): weekly Booked Revenue Recap and Pipelines (Thursday morning); monthly best-estimate close (28th); monthly actuals (15th).\n- **Scheduled downtime notice**: ≥48 hours advance notice (Allrecipes 16.2) [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **No data mining outside the licensed scope** without express written consent (Allrecipes 3.3) — useful precedent for any data partner.\n- **Marketing reproduction of Content excerpts requires prior written approval** (Allrecipes 3.2) — clean limit for press/marketing assets.\n- **Inverted Platform-Fee model (BBC Good Food)** — useful template when Whisk is the platform vendor rather than a revenue-share partner [source: 02-161121 Whisk BBC GF.md].\n\n## Drafting bugs to watch for\n\n- **Allrecipes**:\n  - Clause 11.7.2 conditions Whisk's indemnification on \"Licensor's prior written consent\" but the indemnity in 11.6 runs from Whisk to Licensor — likely should reference indemnifying party generically [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Clause 5.5 cross-references \"clause 5.3\" as carve-back but the publication restriction reads independently [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Clause 13.3.1 service-level \"any period of three consecutive months\" is ambiguous between rolling 3-month and specific quarter [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Clause 5.6 references \"the Licensee\" once although Licensee is not defined; minor inconsistency.\n  - Background IP definition (1.1) cross-references \"clauses 11.2 and 11.3\" but those are about ownership, not lists of contributed Background IP — circular drafting [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Schedule 1 row for Argentina has blank Language of Content cell — drafting gap [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - The \"Whisk Revenue Sharing – UK\" appendix at end of file describes a 50/50 UK split but is not numbered as a Schedule and not expressly incorporated by clause 7.1 — unclear contractual status; treat as illustrative until validated against an Addendum [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **BBC Good Food**:\n  - Term Sheet \"3 months months following the Effective Date\" (duplicate \"months\").\n  - Clause 4.1 ends with \"(Platform Fees):\" with trailing colon and no enumerated subclauses — appears truncated [source: 02-161121 Whisk BBC GF.md].\n  - Liability-cap clause references Platform Fees flowing the wrong way (see table above).\n  - \"Content Materials\" used in indemnity but not defined.\n  - Delivery Date \"Flexible and TBC. Target date of 1st February 2017\" — soft commitment; no consequence for missing it.\n  - Whisk has unilateral right to remove Content where it reasonably believes Content may create liability (clause 3.4) — broad discretion; flag if a future publisher asks why this is so wide.\n\n## Data protection gap\n\n- Allrecipes references **Directive 95/46/EC and the E-Commerce Directive only** — predates GDPR. Any post-2018 reliance needs UK GDPR / DPA 2018 uplift; layer a DPA on top [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- BBC Good Food has only a generic \"comply with applicable data protection legislation\" placeholder — also needs a DPA in any reuse.\n\n## Hard cutoffs / mandatory mechanics under publisher deals\n\n- **24-hour API cutoff** on termination (Allrecipes 5.6).\n- **3-year tail + perpetual deemed licence** on Shared Data (Allrecipes 5.1-5.3).\n- **6-month wind-down** with Licensor non-replacement only where Licensor-initiated termination or commercial unviability (Allrecipes 13.5) — atypical asymmetric obligation.\n- **10-day cure** for material breach (Allrecipes 13.2.1).\n- **90-day Force Majeure termination right** (both deals).\n- **48-hour scheduled-downtime notice** (Allrecipes 16.2).\n- **Audit underpayment ≥10% cost-shift; 45 days to settle underpayment** (Allrecipes 7.7).\n- **Asymmetric CoC termination** in favour of publisher (both deals) — push back on this in future deals.\n",
        "sources": [],
        "playbooks": [
          {
            "id": "intellectual-property-licensing",
            "title": "intellectual property licensing",
            "body": "# Intellectual Property Licensing Playbook (Publisher / Widget licences)\n\nTwo executed-or-near-executed publisher Widget licences in corpus: Allrecipes (executed 12 June 2014) and BBC Good Food (effective 1 December 2016, signature blocks blank in copy). Whisk integrates the Widget/Button into the partner's recipe pages and exposes Shared Data via API.\n\n## Common posture\n\n- **Whisk owns Platform, User Data and Marks**; partner owns Content and Sites [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 02-161121 Whisk BBC GF.md].\n- **English law, exclusive English courts** [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 02-161121 Whisk BBC GF.md].\n- **99.5% availability SLA** framing (Allrecipes) — if matching this in future, scope the SLA measurement clearly: Allrecipes ties it to \"browsers used by ≥10% of Site users monthly\", with failure across \"any 3 consecutive months\" giving the licensor a termination right (a phrasing that is itself ambiguous between rolling and quarterly windows) [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Asymmetric Change-of-Control termination** in favour of the publisher in both deals. Push back on this structurally — Whisk's negotiating template should not concede unilateral CoC termination by default [source: 01-Allrecipes Contract - FINAL 2014-06-12.md] [source: 02-161121 Whisk BBC GF.md].\n- **Mutual IP indemnities** with notice-and-control conditions (Allrecipes 11.4-11.7); one-way licensor IP indemnity for Content (BBC Good Food 7.4) — the licensor-side indemnity is what to push for in any new publisher licence.\n- **Mutual confidentiality**, with carve-outs for public domain / prior possession / third-party / independent development / legal compulsion.\n- **Term Sheet at front** of agreement carrying operative commercial terms (BBC Good Food template) — useful organising pattern.\n\n## Two distinct commercial models\n\n| | Allrecipes 2014 | BBC Good Food 2016 |\n|---|---|---|\n| Cash flow | Whisk shares Retailer/Brand Revenue with Allrecipes; settled within 60 days of each calendar-month Payment Term, in GBP | **BBC Good Food pays Whisk £2,000/month Platform Fee**; BBC Good Food retains 100% affiliate revenue; reporting within 45 days, 30-day pay |\n| Initial Term | 18 months from 2014-06-12 | 12 months from 2016-12-01 |\n| Termination notice (post-Initial) | 6 months | 3 months |\n| Break right | None at start; either party can terminate for material breach (10-day cure) | **Licensor can break c. 1 March 2017** if (a) Platform inaccessible >10% via Button; (b) >5% Users complain in writing; (c) Licensor loses third-party advertising revenue exceeding Revenue Fees as a direct result of the licence |\n| Liability cap | £200,000 aggregate; carve-outs for clause 11 IP indemnities and 10.1 non-excludables | Aggregate cap = Platform Fees in relevant Payment Term (drafting bug — clause 6.3 says Platform Fees \"paid by Whisk to Licensor\" but the flow is the other way) |\n| Exclusivity | Per-Site flag in Schedule 1, with named carve-out (Lakeland Limited) | Licensor undertakes not to integrate any new shopping-list/e-commerce-interoperability feature equivalent to the Widget integration during the term (clause 3.6) |\n| Force Majeure | 90-day termination right (both deals) | Same |\n| Wind-down | 6 months on termination notice; Licensor non-replacement only where Licensor-initiated termination or commercial unviability | Not specified |\n\n## Reusable mechanics worth pulling into new publisher deals\n\n- **Country-by-country revenue split via signed Addendums** (Allrecipes clause 7.1) — useful template for staged rollouts where pricing is jurisdiction-specific [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Schedule 1 \"exclusive\" flag per site with named carve-out** for pre-existing relationships (Allrecipes / Lakeland) [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Audit right with 10% underpayment cost-shift** (Allrecipes 7.7); underpaid amounts due within 45 days of audit; clause survives termination [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Shared Data future-licence mechanism** — restrictions for 3 years post-termination, after which Whisk is **deemed to grant** Licensor a perpetual, irrevocable, non-exclusive, sub-licensable, transferable licence to the Shared Data as it stood on termination notice date (Allrecipes 5.1-5.3). Useful precedent for converting a temporary data-sharing arrangement into a long-tail commercial outcome — but the deemed perpetual licence is **a hard cutoff against Whisk** that future negotiators should be aware of [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **API availability post-termination cap**: API remains accessible no longer than **24 hours after termination notice**; no obligation to push new/updated Shared Data thereafter [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **Reporting cadence template** (Schedule 6, Allrecipes, PST timezone): weekly Booked Revenue Recap and Pipelines (Thursday morning); monthly best-estimate close (28th); monthly actuals (15th).\n- **Scheduled downtime notice**: ≥48 hours advance notice (Allrecipes 16.2) [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **No data mining outside the licensed scope** without express written consent (Allrecipes 3.3) — useful precedent for any data partner.\n- **Marketing reproduction of Content excerpts requires prior written approval** (Allrecipes 3.2) — clean limit for press/marketing assets.\n- **Inverted Platform-Fee model (BBC Good Food)** — useful template when Whisk is the platform vendor rather than a revenue-share partner [source: 02-161121 Whisk BBC GF.md].\n\n## Drafting bugs to watch for\n\n- **Allrecipes**:\n  - Clause 11.7.2 conditions Whisk's indemnification on \"Licensor's prior written consent\" but the indemnity in 11.6 runs from Whisk to Licensor — likely should reference indemnifying party generically [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Clause 5.5 cross-references \"clause 5.3\" as carve-back but the publication restriction reads independently [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Clause 13.3.1 service-level \"any period of three consecutive months\" is ambiguous between rolling 3-month and specific quarter [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Clause 5.6 references \"the Licensee\" once although Licensee is not defined; minor inconsistency.\n  - Background IP definition (1.1) cross-references \"clauses 11.2 and 11.3\" but those are about ownership, not lists of contributed Background IP — circular drafting [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - Schedule 1 row for Argentina has blank Language of Content cell — drafting gap [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n  - The \"Whisk Revenue Sharing – UK\" appendix at end of file describes a 50/50 UK split but is not numbered as a Schedule and not expressly incorporated by clause 7.1 — unclear contractual status; treat as illustrative until validated against an Addendum [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- **BBC Good Food**:\n  - Term Sheet \"3 months months following the Effective Date\" (duplicate \"months\").\n  - Clause 4.1 ends with \"(Platform Fees):\" with trailing colon and no enumerated subclauses — appears truncated [source: 02-161121 Whisk BBC GF.md].\n  - Liability-cap clause references Platform Fees flowing the wrong way (see table above).\n  - \"Content Materials\" used in indemnity but not defined.\n  - Delivery Date \"Flexible and TBC. Target date of 1st February 2017\" — soft commitment; no consequence for missing it.\n  - Whisk has unilateral right to remove Content where it reasonably believes Content may create liability (clause 3.4) — broad discretion; flag if a future publisher asks why this is so wide.\n\n## Data protection gap\n\n- Allrecipes references **Directive 95/46/EC and the E-Commerce Directive only** — predates GDPR. Any post-2018 reliance needs UK GDPR / DPA 2018 uplift; layer a DPA on top [source: 01-Allrecipes Contract - FINAL 2014-06-12.md].\n- BBC Good Food has only a generic \"comply with applicable data protection legislation\" placeholder — also needs a DPA in any reuse.\n\n## Hard cutoffs / mandatory mechanics under publisher deals\n\n- **24-hour API cutoff** on termination (Allrecipes 5.6).\n- **3-year tail + perpetual deemed licence** on Shared Data (Allrecipes 5.1-5.3).\n- **6-month wind-down** with Licensor non-replacement only where Licensor-initiated termination or commercial unviability (Allrecipes 13.5) — atypical asymmetric obligation.\n- **10-day cure** for material breach (Allrecipes 13.2.1).\n- **90-day Force Majeure termination right** (both deals).\n- **48-hour scheduled-downtime notice** (Allrecipes 16.2).\n- **Audit underpayment ≥10% cost-shift; 45 days to settle underpayment** (Allrecipes 7.7).\n- **Asymmetric CoC termination** in favour of publisher (both deals) — push back on this in future deals.\n",
            "sources": [],
            "categories": []
          }
        ]
      },
      {
        "id": "share-options",
        "icon": "ti-trending-up",
        "name": "Share Options",
        "count": 2,
        "body": "# Share Options Playbook (EMI under the Foodient Ltd EMI Share Option Plan)\n\nTwo EMI option agreements in corpus: Powell (4,000 ordinary shares, 3 tranches Jun 2013/2014/2015) and Herron (18,391 ordinary shares, 2 tranches Nov 2013/2014). Both styled as deeds, both with blank signature/witness fields and missing Date of Grant.\n\n## Standard Foodient EMI grant pattern\n\n- **Plan**: Foodient Ltd EMI Share Option Plan, intended to qualify under Schedule 5 ITEPA 2003. Plan Rules (Schedule 2 of each grant) **prevail over the agreement on inconsistency** but are not in the corpus — every review must consult the Rules separately [source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md].\n- **Shares granted**: ordinary shares of £0.00001 nominal at **£0.01 exercise price** (subject to capital-variation adjustments).\n- **No additional Exercise Conditions** beyond those in the Plan Rules (clause 4 in both grants).\n- **Tranche structure tied to anniversaries** (Powell: 11 June 2013/2014/2015; Herron: 25 November 2013/2014). Exercisability is event-driven on top of the tranche dates (an \"Exercise Event\" — termination notice ≥5 days before actual termination, or Rule 11.1–11.4 trigger).\n- **Lapse triggers** (clause 3.4): non-transferable, non-assignable, no security interest; lapses on bankruptcy/insolvency steps; transmission to personal representatives on death does not cause lapse.\n- **Pre-agreed Good Leaver status** for the Option Holder, with Article 7 retention cap of up to 15% of issued share capital (non-voting) and excess shares falling into deemed transfer at open market value (Schedule 1) [source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md] [source: 22-Foodient Ltd. - 2013-10-18 - Articles.md].\n\n## Hard cutoff (the most important one)\n\n**The Option Holder must sign the deed AND complete/return the EMI Notice within 30 days of the Date of Grant, or the Option lapses automatically (clause 2.3).** This is non-discretionary. Both corpus copies have blank Date-of-Grant fields — in any review, confirm:\n\n1. Whether the deed was actually executed and dated.\n2. Whether the EMI Notice was filed with HMRC within 30 days.\n3. Whether HMRC accepted the EMI status (any disqualification gives the Company no liability under clause 6.5 — Option Holder bears the tax risk).\n\n[source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md].\n\n## Tax mechanics (uniform across grants)\n\n- **Tax Liability settled within 7 days of exercise**, otherwise the Company may **withhold and sell Sufficient Shares** (clause 6.2).\n- **Section 431 ITEPA election**: irrevocable agreement to enter joint election on or before exercise if required (clause 6.3).\n- **Power of attorney**: the Company is appointed by the Option Holder to sell Sufficient Shares to cover PAYE/NIC and to execute s.431 elections (clause 6.4).\n- **No-compensation carve-out** for tax/NIC consequences arising from EMI disqualification, HMRC decisions, or Board timing (clause 6.5).\n\n## Articles interaction\n\nOption Shares, when issued, carry through:\n\n- Article 6 pre-emption on transfer.\n- Article 7 deemed transfer on Leaver / death / bankruptcy / etc.\n- Pre-agreed Good Leaver retention cap (15% of issued share capital, non-voting); excess transferred at open market value.\n- Vested vs non-Vested distinction tracked from the Option Holder's Service Agreement date.\n\n[source: 22-Foodient Ltd. - 2013-10-18 - Articles.md].\n\n## Variations between the two grants\n\n| | Powell | Herron |\n|---|---|---|\n| Total shares | 4,000 | 18,391 |\n| Tranches | 1,334 / 1,333 / 1,333 | 12,260 / 6,131 |\n| Tranche dates | 11 Jun 2013 / 2014 / 2015 | 25 Nov 2013 / 2014 |\n| Schedule 2 (Plan Rules) | Referenced, not included | Referenced, not included |\n| Date of Grant | \"DATED 2012\" (no day/month) | \"DATED\" line blank |\n| Signed | Blank | Blank |\n\n## Drafting / risk points to flag on review\n\n- **Blank Date of Grant** in both grants makes 30-day lapse trigger impossible to apply without external evidence.\n- **Tranche dates are now historic** (latest is 25 Nov 2014), so on a clean reading both grants would be fully exercisable on an Exercise Event — but only if the deed and EMI Notice were validly returned. Until that is confirmed, treat the options as not validly granted [source: 15-Option Agreement Anthony Herron.md].\n- The agreement says options under the Plan \"may or may not\" qualify as EMI; the Schedule-5 ITEPA framing in clause 1 is conditional on the Notice being filed [source: 04-Option Agreement template Claire Powell v2.md].\n- **Plan Rules cross-references** (Rules 4.2, 4.3, 5.3, 7, 8, 11.1–11.4, 14.7) cannot be verified from the in-corpus documents. Get the Plan Rules before drafting any new grant or assessing any leaver event.\n\n## Reusable points for any new EMI grant\n\n- Use the same 30-day lapse mechanic and EMI Notice obligation.\n- Use the same s.431 / power-of-attorney / Sufficient Shares package — it is well-drafted and consistent.\n- Pre-agree Good Leaver status only where intentional (it is in the template by default); confirm Articles 7.4-7.5 retention cap interaction.\n- Cap retained shares at 15% of issued share capital and make them non-voting; subject excess to deemed transfer at open market value.\n- Tie the tranche dates to a named \"Exercise Event\" definition — relying on Plan Rules 11.1-11.4 alone has historically caused review pain.\n- Include a complete copy of the Plan Rules with each grant so reviewers do not have to chase Schedule 2 separately.\n",
        "sources": [],
        "playbooks": [
          {
            "id": "share-options",
            "title": "share options",
            "body": "# Share Options Playbook (EMI under the Foodient Ltd EMI Share Option Plan)\n\nTwo EMI option agreements in corpus: Powell (4,000 ordinary shares, 3 tranches Jun 2013/2014/2015) and Herron (18,391 ordinary shares, 2 tranches Nov 2013/2014). Both styled as deeds, both with blank signature/witness fields and missing Date of Grant.\n\n## Standard Foodient EMI grant pattern\n\n- **Plan**: Foodient Ltd EMI Share Option Plan, intended to qualify under Schedule 5 ITEPA 2003. Plan Rules (Schedule 2 of each grant) **prevail over the agreement on inconsistency** but are not in the corpus — every review must consult the Rules separately [source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md].\n- **Shares granted**: ordinary shares of £0.00001 nominal at **£0.01 exercise price** (subject to capital-variation adjustments).\n- **No additional Exercise Conditions** beyond those in the Plan Rules (clause 4 in both grants).\n- **Tranche structure tied to anniversaries** (Powell: 11 June 2013/2014/2015; Herron: 25 November 2013/2014). Exercisability is event-driven on top of the tranche dates (an \"Exercise Event\" — termination notice ≥5 days before actual termination, or Rule 11.1–11.4 trigger).\n- **Lapse triggers** (clause 3.4): non-transferable, non-assignable, no security interest; lapses on bankruptcy/insolvency steps; transmission to personal representatives on death does not cause lapse.\n- **Pre-agreed Good Leaver status** for the Option Holder, with Article 7 retention cap of up to 15% of issued share capital (non-voting) and excess shares falling into deemed transfer at open market value (Schedule 1) [source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md] [source: 22-Foodient Ltd. - 2013-10-18 - Articles.md].\n\n## Hard cutoff (the most important one)\n\n**The Option Holder must sign the deed AND complete/return the EMI Notice within 30 days of the Date of Grant, or the Option lapses automatically (clause 2.3).** This is non-discretionary. Both corpus copies have blank Date-of-Grant fields — in any review, confirm:\n\n1. Whether the deed was actually executed and dated.\n2. Whether the EMI Notice was filed with HMRC within 30 days.\n3. Whether HMRC accepted the EMI status (any disqualification gives the Company no liability under clause 6.5 — Option Holder bears the tax risk).\n\n[source: 04-Option Agreement template Claire Powell v2.md] [source: 15-Option Agreement Anthony Herron.md].\n\n## Tax mechanics (uniform across grants)\n\n- **Tax Liability settled within 7 days of exercise**, otherwise the Company may **withhold and sell Sufficient Shares** (clause 6.2).\n- **Section 431 ITEPA election**: irrevocable agreement to enter joint election on or before exercise if required (clause 6.3).\n- **Power of attorney**: the Company is appointed by the Option Holder to sell Sufficient Shares to cover PAYE/NIC and to execute s.431 elections (clause 6.4).\n- **No-compensation carve-out** for tax/NIC consequences arising from EMI disqualification, HMRC decisions, or Board timing (clause 6.5).\n\n## Articles interaction\n\nOption Shares, when issued, carry through:\n\n- Article 6 pre-emption on transfer.\n- Article 7 deemed transfer on Leaver / death / bankruptcy / etc.\n- Pre-agreed Good Leaver retention cap (15% of issued share capital, non-voting); excess transferred at open market value.\n- Vested vs non-Vested distinction tracked from the Option Holder's Service Agreement date.\n\n[source: 22-Foodient Ltd. - 2013-10-18 - Articles.md].\n\n## Variations between the two grants\n\n| | Powell | Herron |\n|---|---|---|\n| Total shares | 4,000 | 18,391 |\n| Tranches | 1,334 / 1,333 / 1,333 | 12,260 / 6,131 |\n| Tranche dates | 11 Jun 2013 / 2014 / 2015 | 25 Nov 2013 / 2014 |\n| Schedule 2 (Plan Rules) | Referenced, not included | Referenced, not included |\n| Date of Grant | \"DATED 2012\" (no day/month) | \"DATED\" line blank |\n| Signed | Blank | Blank |\n\n## Drafting / risk points to flag on review\n\n- **Blank Date of Grant** in both grants makes 30-day lapse trigger impossible to apply without external evidence.\n- **Tranche dates are now historic** (latest is 25 Nov 2014), so on a clean reading both grants would be fully exercisable on an Exercise Event — but only if the deed and EMI Notice were validly returned. Until that is confirmed, treat the options as not validly granted [source: 15-Option Agreement Anthony Herron.md].\n- The agreement says options under the Plan \"may or may not\" qualify as EMI; the Schedule-5 ITEPA framing in clause 1 is conditional on the Notice being filed [source: 04-Option Agreement template Claire Powell v2.md].\n- **Plan Rules cross-references** (Rules 4.2, 4.3, 5.3, 7, 8, 11.1–11.4, 14.7) cannot be verified from the in-corpus documents. Get the Plan Rules before drafting any new grant or assessing any leaver event.\n\n## Reusable points for any new EMI grant\n\n- Use the same 30-day lapse mechanic and EMI Notice obligation.\n- Use the same s.431 / power-of-attorney / Sufficient Shares package — it is well-drafted and consistent.\n- Pre-agree Good Leaver status only where intentional (it is in the template by default); confirm Articles 7.4-7.5 retention cap interaction.\n- Cap retained shares at 15% of issued share capital and make them non-voting; subject excess to deemed transfer at open market value.\n- Tie the tranche dates to a named \"Exercise Event\" definition — relying on Plan Rules 11.1-11.4 alone has historically caused review pain.\n- Include a complete copy of the Plan Rules with each grant so reviewers do not have to chase Schedule 2 separately.\n",
            "sources": [],
            "categories": []
          }
        ]
      },
      {
        "id": "debt-finance",
        "icon": "ti-folder",
        "name": "Debt Finance",
        "count": 2,
        "body": "# Debt Finance Playbook (EALP Quasi-Equity and Loan Notes)\n\nTwo instruments in corpus: the EALP Quasi-Equity Agreement (deed, January 2013, £37,400 advance) and a Loan Note Certificate template (Schedule 1 to a missing Loan Note Instrument). The Subscription Agreement also references parallel Quasi-Equity Agreements for EALP, BCC and Guy Morris (matched to their share subscriptions).\n\n## EALP / Foodient quasi-equity pattern\n\n- **\"Quasi-equity\" structure**: fixed advance + interest + repayment gated on prior debt being cleared and an EBITDA threshold, capped at the lower of a fixed £ amount or 25% of EBITDA per quarter. Cashflow-linked, founder-friendly debt — useful as a template pattern [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Stacking convention**: this Agreement explicitly subordinates its repayments behind a **Prior Quasi-Equity (£12,498.25)** — the seed-Completion EALP loan, which must be fully repaid first [source: 21-EALP Quasi-Equity Jan 2013 1.md] [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- **All EALP rights exercised by the Fund Manager (Midven)** on EALP's behalf — single point of contact for notices and payments [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Negative pledge with reasonableness qualifier**: no liens/charges/encumbrances without EALP's prior written consent, \"such consent not to be unreasonably withheld or delayed\" — softer than absolute negative pledge [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Prepayment minimum £5,000**, no penalty, but conditioned on all arrears/accruals being current [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **No set-off or counterclaim** by Foodient permitted (clause 5.1).\n- **Cross-default into Subscription Agreement**: warranty breach there triggers default here (3.1.2); also default if EALP **ceases to be a shareholder for whatever reason** (3.1.14) or on **change of control** per CTA 2010 s.1124 (3.1.15) [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **No fixed maturity** — uncapped tail risk on duration; repayments are non-amortising until the dual gating condition is met [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Executed as a deed** (12-year limitation under English law for claims).\n\n## Hard cutoffs / mandatory mechanics\n\n- **8% p.a. gross interest**, accruing monthly on outstanding capital (clause 2.2) [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Repayment trigger**: only after (i) the Prior Quasi-Equity (£12,498.25) is fully repaid AND (ii) quarterly EBITDA exceeds **£50,000** (the EBITDA Target). Once met, quarterly instalments of the lower of **£12,501 or 25% of quarterly EBITDA**, including accrued interest [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **14-day non-payment** window before an event of default (clause 3.1.1) — set internal payment-due reminders well inside that window [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **On any event of default**, EALP/Fund Manager can accelerate by written notice, making the full Quasi-Equity Sum and interest immediately payable, or **convert it into on-demand debt** (clause 3.2) [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Tax certificate**: within 7 days after paying any tax deducted at source on interest, Foodient must issue EALP a certificate of tax deduction in HMRC-approved form (clause 2.4.2) — recurring obligation tied to each interest invoice [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **English law, exclusive English courts** (clause 5.8).\n\n## Drafting bugs and risks\n\n- **Foodient signature line, witness details, and the agreement date are blank** in the Markdown copy — execution by Foodient cannot be confirmed [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Clause numbering jumps from 3.1.12 to 3.1.14** (no 3.1.13).\n- **Several capitalised terms** (\"Managers\", \"BCC\", \"Fund Manager\", \"Private Investors\", \"Subscription Agreement\") are imported by reference (clause 1.4) and not defined in this document — full effect requires reading the Subscription Agreement.\n- **\"EBITDA\" is not defined** in this document — calculation method, adjustments, and review/audit rights are unspecified, creating room for dispute on when the £50k threshold is hit. Define EBITDA explicitly on any reuse [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Section 2.4.3** lets EALP unilaterally change the method of payment of interest \"on reasonable notice\" at its sole discretion — operationally significant.\n- **Default trigger 3.1.14** (\"EALP ceasing to be a shareholder for whatever reason\") is unusual: a third-party-driven event (e.g. EALP's exit) would put Foodient in default through no fault of its own. **Push back on this in any future quasi-equity drafting.**\n- **Witness address text appears garbled** (\"Bobon Road, Wexford on Avon, Stafford upon Avon\") — possibly OCR/transcription artefact.\n\n## Loan Note Certificate template (Schedule 1)\n\n- **Form-of-certificate template only** — all variable fields and signature blocks blank in the corpus copy. The underlying **Loan Note Instrument is referenced but is not in the corpus** — the Instrument carries the operative terms (interest, conversion, redemption, events of default) [source: 12-Loan Note Certificate FINAL.md].\n- **Notes type**: unsecured convertible loan notes [source: 12-Loan Note Certificate FINAL.md].\n- **Minimum transfer denomination: £1,000** (per Schedule 4 of the Instrument) [source: 12-Loan Note Certificate FINAL.md].\n- **Certificates executed as a deed** by the Company (with witness).\n- **Certificate must be produced** to register any transfer; no transfer without production.\n- Governed by the laws of England (Note 3); courts not specified in the certificate itself.\n\n## Reusable points for any new debt-finance instrument\n\n- Keep the **8% gross interest, EBITDA-gated repayment** structure for any cashflow-linked founder-friendly debt — but **define EBITDA explicitly**, including audit rights, adjustments, and review timing.\n- Replace **default trigger 3.1.14** (\"EALP ceasing to be a shareholder for whatever reason\") with a more conventional change-of-creditor/lender mechanic.\n- Always populate the date and execution blocks before treating the deed as live.\n- For any loan note issuance, capture: board resolution date, Instrument date, certificate execution date, holder name/address, and certificate amount on each certificate at the time of issue.\n- **Cross-reference the underlying Loan Note Instrument** explicitly in any certificate; both must be retrievable for transfer or enforcement actions.\n",
        "sources": [],
        "playbooks": [
          {
            "id": "debt-finance",
            "title": "debt finance",
            "body": "# Debt Finance Playbook (EALP Quasi-Equity and Loan Notes)\n\nTwo instruments in corpus: the EALP Quasi-Equity Agreement (deed, January 2013, £37,400 advance) and a Loan Note Certificate template (Schedule 1 to a missing Loan Note Instrument). The Subscription Agreement also references parallel Quasi-Equity Agreements for EALP, BCC and Guy Morris (matched to their share subscriptions).\n\n## EALP / Foodient quasi-equity pattern\n\n- **\"Quasi-equity\" structure**: fixed advance + interest + repayment gated on prior debt being cleared and an EBITDA threshold, capped at the lower of a fixed £ amount or 25% of EBITDA per quarter. Cashflow-linked, founder-friendly debt — useful as a template pattern [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Stacking convention**: this Agreement explicitly subordinates its repayments behind a **Prior Quasi-Equity (£12,498.25)** — the seed-Completion EALP loan, which must be fully repaid first [source: 21-EALP Quasi-Equity Jan 2013 1.md] [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- **All EALP rights exercised by the Fund Manager (Midven)** on EALP's behalf — single point of contact for notices and payments [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Negative pledge with reasonableness qualifier**: no liens/charges/encumbrances without EALP's prior written consent, \"such consent not to be unreasonably withheld or delayed\" — softer than absolute negative pledge [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Prepayment minimum £5,000**, no penalty, but conditioned on all arrears/accruals being current [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **No set-off or counterclaim** by Foodient permitted (clause 5.1).\n- **Cross-default into Subscription Agreement**: warranty breach there triggers default here (3.1.2); also default if EALP **ceases to be a shareholder for whatever reason** (3.1.14) or on **change of control** per CTA 2010 s.1124 (3.1.15) [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **No fixed maturity** — uncapped tail risk on duration; repayments are non-amortising until the dual gating condition is met [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Executed as a deed** (12-year limitation under English law for claims).\n\n## Hard cutoffs / mandatory mechanics\n\n- **8% p.a. gross interest**, accruing monthly on outstanding capital (clause 2.2) [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Repayment trigger**: only after (i) the Prior Quasi-Equity (£12,498.25) is fully repaid AND (ii) quarterly EBITDA exceeds **£50,000** (the EBITDA Target). Once met, quarterly instalments of the lower of **£12,501 or 25% of quarterly EBITDA**, including accrued interest [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **14-day non-payment** window before an event of default (clause 3.1.1) — set internal payment-due reminders well inside that window [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **On any event of default**, EALP/Fund Manager can accelerate by written notice, making the full Quasi-Equity Sum and interest immediately payable, or **convert it into on-demand debt** (clause 3.2) [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Tax certificate**: within 7 days after paying any tax deducted at source on interest, Foodient must issue EALP a certificate of tax deduction in HMRC-approved form (clause 2.4.2) — recurring obligation tied to each interest invoice [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **English law, exclusive English courts** (clause 5.8).\n\n## Drafting bugs and risks\n\n- **Foodient signature line, witness details, and the agreement date are blank** in the Markdown copy — execution by Foodient cannot be confirmed [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Clause numbering jumps from 3.1.12 to 3.1.14** (no 3.1.13).\n- **Several capitalised terms** (\"Managers\", \"BCC\", \"Fund Manager\", \"Private Investors\", \"Subscription Agreement\") are imported by reference (clause 1.4) and not defined in this document — full effect requires reading the Subscription Agreement.\n- **\"EBITDA\" is not defined** in this document — calculation method, adjustments, and review/audit rights are unspecified, creating room for dispute on when the £50k threshold is hit. Define EBITDA explicitly on any reuse [source: 21-EALP Quasi-Equity Jan 2013 1.md].\n- **Section 2.4.3** lets EALP unilaterally change the method of payment of interest \"on reasonable notice\" at its sole discretion — operationally significant.\n- **Default trigger 3.1.14** (\"EALP ceasing to be a shareholder for whatever reason\") is unusual: a third-party-driven event (e.g. EALP's exit) would put Foodient in default through no fault of its own. **Push back on this in any future quasi-equity drafting.**\n- **Witness address text appears garbled** (\"Bobon Road, Wexford on Avon, Stafford upon Avon\") — possibly OCR/transcription artefact.\n\n## Loan Note Certificate template (Schedule 1)\n\n- **Form-of-certificate template only** — all variable fields and signature blocks blank in the corpus copy. The underlying **Loan Note Instrument is referenced but is not in the corpus** — the Instrument carries the operative terms (interest, conversion, redemption, events of default) [source: 12-Loan Note Certificate FINAL.md].\n- **Notes type**: unsecured convertible loan notes [source: 12-Loan Note Certificate FINAL.md].\n- **Minimum transfer denomination: £1,000** (per Schedule 4 of the Instrument) [source: 12-Loan Note Certificate FINAL.md].\n- **Certificates executed as a deed** by the Company (with witness).\n- **Certificate must be produced** to register any transfer; no transfer without production.\n- Governed by the laws of England (Note 3); courts not specified in the certificate itself.\n\n## Reusable points for any new debt-finance instrument\n\n- Keep the **8% gross interest, EBITDA-gated repayment** structure for any cashflow-linked founder-friendly debt — but **define EBITDA explicitly**, including audit rights, adjustments, and review timing.\n- Replace **default trigger 3.1.14** (\"EALP ceasing to be a shareholder for whatever reason\") with a more conventional change-of-creditor/lender mechanic.\n- Always populate the date and execution blocks before treating the deed as live.\n- For any loan note issuance, capture: board resolution date, Instrument date, certificate execution date, holder name/address, and certificate amount on each certificate at the time of issue.\n- **Cross-reference the underlying Loan Note Instrument** explicitly in any certificate; both must be retrievable for transfer or enforcement actions.\n",
            "sources": [],
            "categories": []
          }
        ]
      },
      {
        "id": "corporate",
        "icon": "ti-folder",
        "name": "Corporate",
        "count": 2,
        "body": "",
        "sources": [
          "17-Foodient_certificate_of_incorporation.md",
          "18-Foodient_memorandum_of_association.md"
        ],
        "playbooks": []
      },
      {
        "id": "service-agreements",
        "icon": "ti-briefcase",
        "name": "Service Agreements",
        "count": 1,
        "body": "# Service / Consultancy Agreements Playbook\n\nSingle example in corpus: the 12 March 2018 Consultancy Agreement with **Milica Stojic** (Serbia-based contractor providing data/ontology management for the Whisk smart food platform). Drafted as a deed.\n\n## Standard Foodient consultancy posture\n\n- **Independent-contractor framing** with explicit **status indemnity** for income tax, NICs and any worker-status / employment-related claim brought by the contractor [source: 03-Consultancy agreement Milica Stojic.md].\n- **Bribery Act 2010 compliance package**: defined Relevant Requirements and Relevant Policies, flow-down to associated persons, **annual compliance certification** within 2 months of start and annually thereafter, breach is deemed material [source: 03-Consultancy agreement Milica Stojic.md].\n- **Standard IP capture**: present and future assignment of all IP in Works and Inventions, trust over unvested rights, moral-rights waiver, irrevocable power of attorney, and IP indemnity backed by required liability insurance noting the Client's interest [source: 03-Consultancy agreement Milica Stojic.md].\n- **Business Opportunities clause**: Consultant must offer Client first refusal on any opportunity related to the Business of the Client before offering it elsewhere.\n- **Other activities restraint**: while engaged, Consultant may take other work but not in a similar/competitive business without prior written consent, and must prioritise Client's work.\n- **Client set-off right**: indemnities and sums owed to Client may be deducted from fees due to the Consultant.\n- **Personal liability** for the Consultant; broad indemnities; no liability cap.\n- **Termination on 2 weeks' written notice** by either party; immediate-termination triggers include 30-day aggregate Incapacity in 52 weeks, gross misconduct, serious/repeated breach, criminal conviction (other than minor road traffic), Bribery Act offence, fraud/dishonesty.\n- **Termination-day hygiene**: return of Client Property, irretrievable deletion of Client information including from personal social/professional networks, and a signed compliance statement.\n- **English law, exclusive English courts**.\n\n## Hard cutoffs to remember\n\n- **Anti-bribery certification within 2 months of agreement date and annually thereafter**, with supporting evidence on request (clause 3.8.6) — **recurring obligation** worth tracking [source: 03-Consultancy agreement Milica Stojic.md].\n- **Termination on at least 2 weeks' written notice** from either side.\n- **30 days' aggregate Incapacity in 52 weeks** = immediate termination right.\n\n## Drafting bugs and risks to fix on reuse\n\n- **Fee typo**: source reads \"$5per hour\" — likely \"$5 per hour\" but the rate is unusually low for technical work; confirm against original [source: 03-Consultancy agreement Milica Stojic.md].\n- **Time commitment unit missing**: clause 3.1.2 says \"devote at least 18 in each calendar month\" — the unit (hours/days) is missing.\n- **Schedule cross-reference malformed**: Services defined as described in \"the 0 1.\" (broken reference to Schedule 1).\n- **Data protection clause references DPA 1998 only** — pre-GDPR; unsuitable today.\n- **Blanket non-EEA transfer consent** \"in order to further its business interests\" — broad and likely non-compliant under UK GDPR. Replace with a transfer-specific consent and IDTA/SCC layer.\n- **No specific cross-border tax/data-transfer drafting** despite the Consultant being in Serbia (outside UK/EEA) — treat as a known gap.\n- **Execution status unclear**: deed-execution blocks for Foodient (Holzherr) and Stojic both blank in the Markdown copy.\n\n## Reusable points\n\n- **Use the Bribery Act package** as the default for new consultancy / contractor engagements. The annual certification mechanic is a clean way to keep flow-down obligations alive.\n- **Use the IP package** (present + future assignment, moral-rights waiver, power of attorney, indemnity, insurance) for any contractor producing technical or creative work.\n- **Use the Business Opportunities clause** for any contractor with sales/BD exposure.\n- **Default termination on 2 weeks' written notice** is short — consider 1 month for senior or business-critical roles.\n- **No liability cap** is a Foodient contractor default — push back on consultants who try to introduce one.\n- **Data protection / transfer drafting** must be GDPR-fit for any new template. For non-UK/EEA consultants, layer a UK IDTA / SCCs and a transfer impact assessment, and replace the blanket consent.\n- **Add a UpWork/Payoneer authorisation** if invoicing through those rails — Stojic agreement does this and is a clean precedent.\n",
        "sources": [],
        "playbooks": [
          {
            "id": "service-agreements",
            "title": "service agreements",
            "body": "# Service / Consultancy Agreements Playbook\n\nSingle example in corpus: the 12 March 2018 Consultancy Agreement with **Milica Stojic** (Serbia-based contractor providing data/ontology management for the Whisk smart food platform). Drafted as a deed.\n\n## Standard Foodient consultancy posture\n\n- **Independent-contractor framing** with explicit **status indemnity** for income tax, NICs and any worker-status / employment-related claim brought by the contractor [source: 03-Consultancy agreement Milica Stojic.md].\n- **Bribery Act 2010 compliance package**: defined Relevant Requirements and Relevant Policies, flow-down to associated persons, **annual compliance certification** within 2 months of start and annually thereafter, breach is deemed material [source: 03-Consultancy agreement Milica Stojic.md].\n- **Standard IP capture**: present and future assignment of all IP in Works and Inventions, trust over unvested rights, moral-rights waiver, irrevocable power of attorney, and IP indemnity backed by required liability insurance noting the Client's interest [source: 03-Consultancy agreement Milica Stojic.md].\n- **Business Opportunities clause**: Consultant must offer Client first refusal on any opportunity related to the Business of the Client before offering it elsewhere.\n- **Other activities restraint**: while engaged, Consultant may take other work but not in a similar/competitive business without prior written consent, and must prioritise Client's work.\n- **Client set-off right**: indemnities and sums owed to Client may be deducted from fees due to the Consultant.\n- **Personal liability** for the Consultant; broad indemnities; no liability cap.\n- **Termination on 2 weeks' written notice** by either party; immediate-termination triggers include 30-day aggregate Incapacity in 52 weeks, gross misconduct, serious/repeated breach, criminal conviction (other than minor road traffic), Bribery Act offence, fraud/dishonesty.\n- **Termination-day hygiene**: return of Client Property, irretrievable deletion of Client information including from personal social/professional networks, and a signed compliance statement.\n- **English law, exclusive English courts**.\n\n## Hard cutoffs to remember\n\n- **Anti-bribery certification within 2 months of agreement date and annually thereafter**, with supporting evidence on request (clause 3.8.6) — **recurring obligation** worth tracking [source: 03-Consultancy agreement Milica Stojic.md].\n- **Termination on at least 2 weeks' written notice** from either side.\n- **30 days' aggregate Incapacity in 52 weeks** = immediate termination right.\n\n## Drafting bugs and risks to fix on reuse\n\n- **Fee typo**: source reads \"$5per hour\" — likely \"$5 per hour\" but the rate is unusually low for technical work; confirm against original [source: 03-Consultancy agreement Milica Stojic.md].\n- **Time commitment unit missing**: clause 3.1.2 says \"devote at least 18 in each calendar month\" — the unit (hours/days) is missing.\n- **Schedule cross-reference malformed**: Services defined as described in \"the 0 1.\" (broken reference to Schedule 1).\n- **Data protection clause references DPA 1998 only** — pre-GDPR; unsuitable today.\n- **Blanket non-EEA transfer consent** \"in order to further its business interests\" — broad and likely non-compliant under UK GDPR. Replace with a transfer-specific consent and IDTA/SCC layer.\n- **No specific cross-border tax/data-transfer drafting** despite the Consultant being in Serbia (outside UK/EEA) — treat as a known gap.\n- **Execution status unclear**: deed-execution blocks for Foodient (Holzherr) and Stojic both blank in the Markdown copy.\n\n## Reusable points\n\n- **Use the Bribery Act package** as the default for new consultancy / contractor engagements. The annual certification mechanic is a clean way to keep flow-down obligations alive.\n- **Use the IP package** (present + future assignment, moral-rights waiver, power of attorney, indemnity, insurance) for any contractor producing technical or creative work.\n- **Use the Business Opportunities clause** for any contractor with sales/BD exposure.\n- **Default termination on 2 weeks' written notice** is short — consider 1 month for senior or business-critical roles.\n- **No liability cap** is a Foodient contractor default — push back on consultants who try to introduce one.\n- **Data protection / transfer drafting** must be GDPR-fit for any new template. For non-UK/EEA consultants, layer a UK IDTA / SCCs and a transfer impact assessment, and replace the blanket consent.\n- **Add a UpWork/Payoneer authorisation** if invoicing through those rails — Stojic agreement does this and is a clean precedent.\n",
            "sources": [],
            "categories": []
          }
        ]
      },
      {
        "id": "other",
        "icon": "ti-folder",
        "name": "Other",
        "count": 1,
        "body": "",
        "sources": [
          "05-Org Chart.md"
        ],
        "playbooks": []
      },
      {
        "id": "joint-venture-agreements",
        "icon": "ti-folder",
        "name": "Joint Venture Agreements",
        "count": 1,
        "body": "# Joint Venture / Strategic Collaboration Playbook (McCormick deal)\n\nSingle example in corpus: the 2014 Strategic Services and Collaboration Agreement with **McCormick & Company, Inc.** This is a hybrid services-plus-financing structure with a £400,000 convertible note running alongside (Exhibit C, body not in corpus).\n\n## Hybrid structure to recognise\n\n- **Services agreement + financing**: a £400,000 convertible promissory note from McCormick to Whisk (Exhibit C) accompanies the services contract, with explicit acknowledgement that note proceeds may fund the recipient's performance obligations [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Board observer rights tied to investment**: observer attends board meetings and receives board materials, with carve-outs for (i) majority board determination of conflict/other reasons and (ii) Board-designated sensitive/confidential materials; **no voting rights**, no fiduciary duties [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Joint decision-making via dual Representatives** with unanimous consent for material decisions, plus an explicit carve-out preserving Whisk's ordinary-course business (sales of digital services to retailers; strategic-partner relationships) from the consent requirement [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **No jointly developed IP rule** paired with reciprocal **non-exclusive, non-transferable, revocable, royalty-free licences** scoped solely to the Collaboration purpose and the Term [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Derivatives clause**: no party may make improvements/derivatives of the other's Individual Property without consent; if created, they vest in the original owner via work-made-for-hire plus back-up assignment [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Targeted competition fence**: Whisk is free to serve competitors and develop its own flavor-profile recommendation tech, but cannot integrate **third-party** flavor-profile recommendation tech into Whisk Offerings during the Term, and cannot use any McCormick Individual Property in such activities [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **PII handling**: where one party processes PII for the other, processing only on instructions, mandatory technical/organisational security measures, no third-party disclosure or other use without prior written consent. **No standalone DPA in corpus** — flag for any reuse [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n\n## Hard cutoffs and mandatory mechanics\n\n- **Initial term two years from execution**; one-year renewals **require mutual written agreement of Representatives at least 30 days before end of then-current term**. Missing the 30-day window means non-renewal [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Hard sunset on the fifth anniversary of the Agreement** for every Two Year Period and Post Two Year Period — overrides per-Market triggers and the £400k caps. This is the dominant operational date [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Per-Market trigger**: a Two Year discount window starts only when Whisk reaches **5M monthly impressions** in that Market; UK is deemed started on the Agreement date [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **30-day cure** for material breach.\n- **Immediate insolvency / bankruptcy / assignment-for-creditors termination**.\n- **Asymmetric Change-of-Control termination** — McCormick can terminate immediately on a Whisk CoC; not vice versa.\n- **One-way assignment ban** — Whisk needs McCormick's prior written consent (withholdable for any or no reason); breach renders any purported assignment void and is a material breach. McCormick's assignment is not similarly restricted.\n- **Pre-cost agreement obligation**: parties must negotiate and agree in good faith the cost-share before incurring any material costs [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Work in-kind valuation gate**: work in-kind costs and values must be agreed in writing in advance of projects/campaigns; failure to agree means **zero value applied** [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n\n## Advertising cost model\n\n- **Three-tier pricing** (Widget WA, Shopping List SLA, Store List) using \"higher of / lower of\" formulas tied to Standard Advertising Price (SAP), Average Publisher Share (APS) and CPM floors/ceilings:\n  - Widget (WA): higher of (a) SAP minus 75%, (b) APS plus 25%, (c) £3 CPM.\n  - Shopping List (SLA): lower of (a) £20 CPM plus 25%, (b) lowest 30-day price paid by any other Whisk customer for SLA space minus 5%.\n  - Store List: lower of (a) £20 CPM plus 25%, (b) SAP minus 25%.\n  - Post Two Year Period: higher of (i) SAP minus 50% or (ii) APS plus 50%.\n- **Caps**: £400,000 Discount cap per Two Year Period and £400,000 cap per Post Two Year Period, allocated 50% UK / 30% France / 20% Poland; absolute sunset on fifth anniversary of the Agreement.\n- **One-year £20,000 budget guarantee** for shopping-list advert space from Agreement date.\n- **Inventory of last resort**: discounted advert space is only available where no other party is prepared to buy it at full market price [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Monthly cadence** (Exhibit D): on/before first working day of each month, Whisk informs McCormick of the Standard Advertising Price and Average Publisher Share for the month; McCormick may request reasonable supporting detail; monthly billing in arrears, exclusive of VAT.\n\n## Governance / dispute model\n\n- **New York law** governs (made and to be performed in NY).\n- All disputes finally settled by **ICC arbitration with three arbitrators, seated in London**.\n- Either party may seek **injunctive relief in any court** of competent jurisdiction.\n- For non-arbitral suits subject to the arbitration and injunctive carve-outs, NY Supreme Court (NY County) and SDNY are designated; **jury trial waived**.\n\n## Drafting bugs and risks to flag\n\n- **Execution unclear**: signature blocks blank for both parties; execution date placeholder unfilled despite \"FINAL\" header.\n- **\"[Stuart Renshaw]\"** appears in square brackets in the source, suggesting a placeholder or conditional appointment.\n- **Survival list** (section 17(e)) cross-references \"Section 14 (Limitation of Liability)\" and \"Section 15 (Indemnification)\", but section 14 has an Articles-of-Association tail-fragment that appears to belong to section 13.\n- **Cross-reference drift**: section 11(c) Compelled Disclosure refers to \"Section 9(a) or (b)\" but confidentiality is in section 11; same drift in 11(d). Assignment clause refers to \"Section 18(f)\" but assignment sits at section 19(g).\n- **Whisk warranties on share capital** reflect a **2014-era cap table** (£15.20 issued capital across 1,520,201 shares; 244,750 'A' ordinary + 1,275,451 ordinary) — point-in-time facts and likely now stale; re-warranting these into any successor agreement would be incorrect.\n- **Register of members \"annexed hereto\" and Exhibit F (Articles)** are referenced but the body of the Markdown contains only headers — annexes not in corpus.\n- **Exhibit C (Convertible Promissory Note)** is referenced and incorporated but only the heading is present in this Markdown copy. Note terms (interest, conversion, redemption, events of default) live in the Note itself.\n- **Section 11(a) \"intentionally disclose\"** framing is narrower than the typical \"disclose\" standard in confidentiality.\n- **Section 7 says no royalty/fee payable for the Collaboration**, but section 8 / Exhibit D establish a substantial paid-advertising regime; reconciled by treating advertising fees as outside the Collaboration \"fee\" concept, but the structure is unusual.\n\n## Reusable points if Whisk does another McCormick-shape deal\n\n- Pair the strategic services agreement with the convertible note in the same execution package.\n- Use the Representatives mechanic with monthly minimum meetings and 30-day pre-expiry renewal trigger.\n- Build the advertising cost model around SAP / APS benchmarks plus floors, with absolute caps and a hard sunset date.\n- Make the £-cap allocation per Market explicit and require written agreement to vary.\n- Resist asymmetric Change-of-Control termination — push for mutual or remove.\n- Resist one-way assignment ban — at minimum, condition both sides on consent not unreasonably withheld.\n- Add a standalone DPA covering PII processing flows.\n- Renumber from scratch after edits and re-run cross-references — McCormick's renumbering drift is the single largest drafting risk in this template.\n",
        "sources": [],
        "playbooks": [
          {
            "id": "joint-venture-agreements",
            "title": "joint venture agreements",
            "body": "# Joint Venture / Strategic Collaboration Playbook (McCormick deal)\n\nSingle example in corpus: the 2014 Strategic Services and Collaboration Agreement with **McCormick & Company, Inc.** This is a hybrid services-plus-financing structure with a £400,000 convertible note running alongside (Exhibit C, body not in corpus).\n\n## Hybrid structure to recognise\n\n- **Services agreement + financing**: a £400,000 convertible promissory note from McCormick to Whisk (Exhibit C) accompanies the services contract, with explicit acknowledgement that note proceeds may fund the recipient's performance obligations [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Board observer rights tied to investment**: observer attends board meetings and receives board materials, with carve-outs for (i) majority board determination of conflict/other reasons and (ii) Board-designated sensitive/confidential materials; **no voting rights**, no fiduciary duties [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Joint decision-making via dual Representatives** with unanimous consent for material decisions, plus an explicit carve-out preserving Whisk's ordinary-course business (sales of digital services to retailers; strategic-partner relationships) from the consent requirement [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **No jointly developed IP rule** paired with reciprocal **non-exclusive, non-transferable, revocable, royalty-free licences** scoped solely to the Collaboration purpose and the Term [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Derivatives clause**: no party may make improvements/derivatives of the other's Individual Property without consent; if created, they vest in the original owner via work-made-for-hire plus back-up assignment [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Targeted competition fence**: Whisk is free to serve competitors and develop its own flavor-profile recommendation tech, but cannot integrate **third-party** flavor-profile recommendation tech into Whisk Offerings during the Term, and cannot use any McCormick Individual Property in such activities [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **PII handling**: where one party processes PII for the other, processing only on instructions, mandatory technical/organisational security measures, no third-party disclosure or other use without prior written consent. **No standalone DPA in corpus** — flag for any reuse [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n\n## Hard cutoffs and mandatory mechanics\n\n- **Initial term two years from execution**; one-year renewals **require mutual written agreement of Representatives at least 30 days before end of then-current term**. Missing the 30-day window means non-renewal [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Hard sunset on the fifth anniversary of the Agreement** for every Two Year Period and Post Two Year Period — overrides per-Market triggers and the £400k caps. This is the dominant operational date [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Per-Market trigger**: a Two Year discount window starts only when Whisk reaches **5M monthly impressions** in that Market; UK is deemed started on the Agreement date [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **30-day cure** for material breach.\n- **Immediate insolvency / bankruptcy / assignment-for-creditors termination**.\n- **Asymmetric Change-of-Control termination** — McCormick can terminate immediately on a Whisk CoC; not vice versa.\n- **One-way assignment ban** — Whisk needs McCormick's prior written consent (withholdable for any or no reason); breach renders any purported assignment void and is a material breach. McCormick's assignment is not similarly restricted.\n- **Pre-cost agreement obligation**: parties must negotiate and agree in good faith the cost-share before incurring any material costs [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Work in-kind valuation gate**: work in-kind costs and values must be agreed in writing in advance of projects/campaigns; failure to agree means **zero value applied** [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n\n## Advertising cost model\n\n- **Three-tier pricing** (Widget WA, Shopping List SLA, Store List) using \"higher of / lower of\" formulas tied to Standard Advertising Price (SAP), Average Publisher Share (APS) and CPM floors/ceilings:\n  - Widget (WA): higher of (a) SAP minus 75%, (b) APS plus 25%, (c) £3 CPM.\n  - Shopping List (SLA): lower of (a) £20 CPM plus 25%, (b) lowest 30-day price paid by any other Whisk customer for SLA space minus 5%.\n  - Store List: lower of (a) £20 CPM plus 25%, (b) SAP minus 25%.\n  - Post Two Year Period: higher of (i) SAP minus 50% or (ii) APS plus 50%.\n- **Caps**: £400,000 Discount cap per Two Year Period and £400,000 cap per Post Two Year Period, allocated 50% UK / 30% France / 20% Poland; absolute sunset on fifth anniversary of the Agreement.\n- **One-year £20,000 budget guarantee** for shopping-list advert space from Agreement date.\n- **Inventory of last resort**: discounted advert space is only available where no other party is prepared to buy it at full market price [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n- **Monthly cadence** (Exhibit D): on/before first working day of each month, Whisk informs McCormick of the Standard Advertising Price and Average Publisher Share for the month; McCormick may request reasonable supporting detail; monthly billing in arrears, exclusive of VAT.\n\n## Governance / dispute model\n\n- **New York law** governs (made and to be performed in NY).\n- All disputes finally settled by **ICC arbitration with three arbitrators, seated in London**.\n- Either party may seek **injunctive relief in any court** of competent jurisdiction.\n- For non-arbitral suits subject to the arbitration and injunctive carve-outs, NY Supreme Court (NY County) and SDNY are designated; **jury trial waived**.\n\n## Drafting bugs and risks to flag\n\n- **Execution unclear**: signature blocks blank for both parties; execution date placeholder unfilled despite \"FINAL\" header.\n- **\"[Stuart Renshaw]\"** appears in square brackets in the source, suggesting a placeholder or conditional appointment.\n- **Survival list** (section 17(e)) cross-references \"Section 14 (Limitation of Liability)\" and \"Section 15 (Indemnification)\", but section 14 has an Articles-of-Association tail-fragment that appears to belong to section 13.\n- **Cross-reference drift**: section 11(c) Compelled Disclosure refers to \"Section 9(a) or (b)\" but confidentiality is in section 11; same drift in 11(d). Assignment clause refers to \"Section 18(f)\" but assignment sits at section 19(g).\n- **Whisk warranties on share capital** reflect a **2014-era cap table** (£15.20 issued capital across 1,520,201 shares; 244,750 'A' ordinary + 1,275,451 ordinary) — point-in-time facts and likely now stale; re-warranting these into any successor agreement would be incorrect.\n- **Register of members \"annexed hereto\" and Exhibit F (Articles)** are referenced but the body of the Markdown contains only headers — annexes not in corpus.\n- **Exhibit C (Convertible Promissory Note)** is referenced and incorporated but only the heading is present in this Markdown copy. Note terms (interest, conversion, redemption, events of default) live in the Note itself.\n- **Section 11(a) \"intentionally disclose\"** framing is narrower than the typical \"disclose\" standard in confidentiality.\n- **Section 7 says no royalty/fee payable for the Collaboration**, but section 8 / Exhibit D establish a substantial paid-advertising regime; reconciled by treating advertising fees as outside the Collaboration \"fee\" concept, but the structure is unusual.\n\n## Reusable points if Whisk does another McCormick-shape deal\n\n- Pair the strategic services agreement with the convertible note in the same execution package.\n- Use the Representatives mechanic with monthly minimum meetings and 30-day pre-expiry renewal trigger.\n- Build the advertising cost model around SAP / APS benchmarks plus floors, with absolute caps and a hard sunset date.\n- Make the £-cap allocation per Market explicit and require written agreement to vary.\n- Resist asymmetric Change-of-Control termination — push for mutual or remove.\n- Resist one-way assignment ban — at minimum, condition both sides on consent not unreasonably withheld.\n- Add a standalone DPA covering PII processing flows.\n- Renumber from scratch after edits and re-run cross-references — McCormick's renumbering drift is the single largest drafting risk in this template.\n",
            "sources": [],
            "categories": []
          }
        ]
      },
      {
        "id": "corporate-governance",
        "icon": "ti-building",
        "name": "Corporate Governance",
        "count": 1,
        "body": "",
        "sources": [
          "22-Foodient Ltd. - 2013-10-18 - Articles.md"
        ],
        "playbooks": []
      },
      {
        "id": "pre-seed-seed-funding",
        "icon": "ti-cash",
        "name": "Pre-Seed & Seed Funding",
        "count": 1,
        "body": "",
        "sources": [
          "23-Whisk Sub Agreement - 12 June 2012.md"
        ],
        "playbooks": []
      }
    ]
  },
  "files": [
    {
      "id": "01-allrecipes-contract-final-2014-06-12",
      "file": "01-Allrecipes Contract - FINAL 2014-06-12.md",
      "title": "Licence Agreement (Widget integration and content licence)",
      "category": "Intellectual Property Licensing",
      "status": "executed",
      "statusNotes": "Both signature blocks show signed names (Patricia Smith for Allrecipes; Nick Holzherr for Foodient). \"(signed)\" annotation only appears next to Allrecipes signatory.",
      "executionDate": "2014-06-12",
      "effectiveDate": "2014-06-12",
      "expiryDate": "",
      "governingLaw": "England",
      "governingCourts": "exclusive English courts",
      "primaryPartyName": "Allrecipes.com, Inc.",
      "primaryPartyId": "allrecipes-com-inc",
      "primaryParties": [
        {
          "name": "Allrecipes.com, Inc.",
          "role": "Licensor (Sites operator and Content proprietor)",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "413 Pine Street Suite 500, Seattle, WA 98101, USA"
          }
        },
        {
          "name": "Foodient Ltd",
          "role": "Licensee / Platform operator (referred to as \"Whisk\")",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "email": "tech@whisk.co.uk",
            "address": "c/o Nick Holzherr, Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham B7 4BB (company no. 8001091)"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Patricia Smith",
          "role": "Director, signing for Allrecipes.com, Inc.",
          "appears_in": "Signature block"
        },
        {
          "name": "Nick Holzherr",
          "role": "Director, signing for Foodient Ltd",
          "appears_in": "Signature block; also named in Foodient registered office address"
        },
        {
          "name": "Lakeland Limited",
          "role": "Excluded counterparty carve-out from exclusivity (Alexandra Buildings, Windermere, Cumbria, LA23 1BQ)",
          "appears_in": "Clause 8.2"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "02-161121-whisk-bbc-gf",
      "file": "02-161121 Whisk BBC GF.md",
      "title": "Whisk Publisher Agreement (Widget licence)",
      "category": "Intellectual Property Licensing",
      "status": "needs-attention",
      "statusNotes": "Signature blocks name Marc Humby (BBC Worldwide) and Nick Holzherr (Foodient) but the Markdown shows blank signature lines; no execution date evidenced.",
      "executionDate": "2016-12-01",
      "effectiveDate": "2016-12-01",
      "expiryDate": "",
      "governingLaw": "England",
      "governingCourts": "exclusive English courts",
      "primaryPartyName": "BBC Worldwide Limited",
      "primaryPartyId": "bbc-worldwide-limited",
      "primaryParties": [
        {
          "name": "BBC Worldwide Limited",
          "role": "Licensor (content provider, site operator)",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Customer",
            "Partner"
          ],
          "contact": {
            "address": "Television Centre, 101 Wood Lane, London W12 7FA, UK"
          }
        },
        {
          "name": "Foodient Ltd (trading as Whisk)",
          "role": "Platform / Widget operator (Whisk)",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Supplier",
            "Partner"
          ],
          "contact": {
            "address": "Cornwall House, 31 Lionel Street, Birmingham, B3 1AP, UK"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Marc Humby",
          "role": "Director signatory for BBC Worldwide Limited",
          "appears_in": "Signed for BBC Worldwide Limited"
        },
        {
          "name": "Nick Holzherr",
          "role": "Director signatory for Foodient Ltd",
          "appears_in": "Signed for Foodient Ltd (Whisk)"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "03-consultancy-agreement-milica-stojic",
      "file": "03-Consultancy agreement Milica Stojic.md",
      "title": "Consultancy Agreement (executed as a deed)",
      "category": "Service Agreements",
      "status": "needs-attention",
      "statusNotes": "Dated 12 March 2018 and stated to be executed as a deed, but signature lines for both Foodient (Nick Holzherr) and the Consultant are blank in the Markdown copy.",
      "executionDate": "2018-03-12",
      "effectiveDate": "2018-03-12",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "exclusive jurisdiction of the courts of England and Wales",
      "primaryPartyName": "Milica Stojic",
      "primaryPartyId": "milica-stojic",
      "primaryParties": [
        {
          "name": "Foodient Ltd",
          "role": "Client",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Customer"
          ],
          "contact": {
            "address": "Cornwall House, 31 Lionel St, Birmingham, West Midlands B3 1AP (registered office; company number 08001091)"
          }
        },
        {
          "name": "Milica Stojic",
          "role": "Consultant (independent contractor)",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Contractor"
          ],
          "contact": {
            "address": "Jove Maksina 26 a, 26000 Pancevo, Serbia"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Nick Holzherr",
          "role": "Director signing the deed for Foodient Ltd",
          "appears_in": "Execution block (\"Executed as a deed by Foodient Ltd. acting by Nick Holzherr, a director\")"
        },
        {
          "name": "Ruzica Miladinovic",
          "role": "Reporting line for the Consultant (or another person advised during the contract)",
          "appears_in": "Schedule 1 – Services"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "04-option-agreement-template-claire-powell-v2",
      "file": "04-Option Agreement template Claire Powell v2.md",
      "title": "EMI Option Agreement (deed)",
      "category": "Share Options",
      "status": "needs-attention",
      "statusNotes": "Executed as a deed, but signature/witness fields and dated header (\"DATED 2012\") are blank in the Markdown copy; execution state cannot be confirmed from source.",
      "executionDate": "",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "exclusive courts of England and Wales",
      "primaryPartyName": "Claire Louise Powell",
      "primaryPartyId": "claire-louise-powell",
      "primaryParties": [
        {
          "name": "Foodient Ltd",
          "role": "Company / Option Grantor",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ],
          "contact": {
            "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham, West Midlands B7 4BB"
          }
        },
        {
          "name": "Claire Louise Powell",
          "role": "Option Holder (employee)",
          "is_user_company": false,
          "entity_type": "person",
          "organization": "Foodient Ltd",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "Farthings, Sheeplands Lane, Sherbourne, Dorset, DT9 4BW"
          }
        }
      ],
      "otherNamedParties": [],
      "flags": [],
      "value": null
    },
    {
      "id": "05-org-chart",
      "file": "05-Org Chart.md",
      "title": "Internal Org Chart",
      "category": "Other",
      "status": "executed",
      "statusNotes": "Informational snapshot dated 20 May 2014; not a contract requiring signature.",
      "executionDate": "",
      "effectiveDate": "2014-05-20",
      "expiryDate": "",
      "governingLaw": "",
      "governingCourts": "",
      "primaryPartyName": "Foodient (Whisk)",
      "primaryPartyId": "foodient-whisk",
      "primaryParties": [
        {
          "name": "Foodient (Whisk)",
          "role": "Subject company (org chart owner)",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ]
        }
      ],
      "otherNamedParties": [],
      "flags": [],
      "value": null
    },
    {
      "id": "06-mutual-nda-foodient-greatbritishchefs",
      "file": "06-Mutual_NDA_Foodient_GreatBritishChefs.md",
      "title": "Mutual Non-Disclosure Agreement",
      "category": "Confidentiality & Non-Disclosure Agreements",
      "status": "needs-attention",
      "statusNotes": "Dated 09.07.2012 with Nicolas Holzherr (Co-Founder) named for Foodient, but signature lines are blank in the Markdown copy and no Great British Chefs signatory name/title is recorded.",
      "executionDate": "2012-07-09",
      "effectiveDate": "",
      "expiryDate": "2017-07-09",
      "governingLaw": "England",
      "governingCourts": "non-exclusive jurisdiction of the courts of England",
      "primaryPartyName": "Great British Chefs Ltd",
      "primaryPartyId": "great-british-chefs-ltd",
      "primaryParties": [
        {
          "name": "Foodient Ltd",
          "role": "Mutual Disclosing/Receiving Party",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "Faraday Wharf, Birmingham, B7 4BB (registered office); Company No. 08001091"
          }
        },
        {
          "name": "Great British Chefs Ltd",
          "role": "Mutual Disclosing/Receiving Party",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "72 Queen's Head Street, London, N1 8NG (registered office); Company No. 07470770"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Nicolas Holzherr",
          "role": "Co-Founder, Foodient Ltd (named signatory)",
          "appears_in": "Signature block for Foodient (signature line blank)"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "07-mutual-nda-reciply-foodity",
      "file": "07-Mutual_NDA_Reciply_Foodity.md",
      "title": "Mutual Non-Disclosure Agreement",
      "category": "Confidentiality & Non-Disclosure Agreements",
      "status": "needs-attention",
      "statusNotes": "Signature blocks list signatories (Nicolas Holzherr, Co-Founder for Recip.ly; Johnathan Agnes, Commercial Lead for Foodity) but the signature lines themselves appear blank in the Markdown copy.",
      "executionDate": "2012-03-02",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "England",
      "governingCourts": "non-exclusive jurisdiction of the courts of England",
      "primaryPartyName": "Recip.ly Ltd.",
      "primaryPartyId": "recip-ly-ltd",
      "primaryParties": [
        {
          "name": "Recip.ly Ltd.",
          "role": "Disclosing Party and Receiving Party (mutual)",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "Flat 1, 57 Dock View Road, Barry, Cardiff CF63 4LQ (Company No. 07341990)"
          }
        },
        {
          "name": "Foodity Ltd.",
          "role": "Disclosing Party and Receiving Party (mutual)",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "Suffolk House, George Street, Croydon, Surrey, CR0 0YN (Company No. 07139884)"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Nicolas Holzherr",
          "role": "Co-Founder, signatory for Recip.ly Ltd.",
          "appears_in": "Signature block"
        },
        {
          "name": "Johnathan Agnes",
          "role": "Commercial Lead, signatory for Foodity Ltd.",
          "appears_in": "Signature block"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "08-120712-claire-powell-employment-contract",
      "file": "08-120712 Claire Powell Employment Contract.md",
      "title": "Employment Contract (Section 1 ERA 1996 statement)",
      "category": "Employment Contracts",
      "status": "needs-attention",
      "statusNotes": "Signature blocks present for Nick Holzherr (for Foodient Limited) and Claire Louise Powell, but the Markdown shows blank signature lines and no signed date.",
      "executionDate": "2012-07-12",
      "effectiveDate": "2012-06-25",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "",
      "primaryPartyName": "Claire Louise Powell",
      "primaryPartyId": "claire-louise-powell",
      "primaryParties": [
        {
          "name": "Foodient Limited",
          "role": "Employer",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Employee"
          ]
        },
        {
          "name": "Claire Louise Powell",
          "role": "Employee (Marketing Assistant)",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "Farthings, Sheeplands Lane, Sherbourne, Dorset, DT9 4BW"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Nick Holzherr",
          "role": "Signatory for Foodient Limited",
          "appears_in": "Signed for and on behalf of Foodient Limited"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "09-collaboration-agreement-whisk-mkc-final",
      "file": "09-Collaboration Agreement Whisk & MKC FINAL.md",
      "title": "Strategic Services and Collaboration Agreement",
      "category": "Joint Venture Agreements",
      "status": "needs-attention",
      "statusNotes": "Marked \"FINAL\" but signature blocks (Name/Title) for both parties are blank and execution date placeholder (\"_________, 2014\") is unfilled.",
      "executionDate": "",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "State of New York",
      "governingCourts": "ICC arbitration seated in London (three arbitrators); Supreme Court of the State of New York (NY County) and US District Court for SDNY for non-arbitral proceedings; injunctive relief available in any court of competent jurisdiction",
      "primaryPartyName": "McCormick & Company, Incorporated",
      "primaryPartyId": "mccormick-company-incorporated",
      "primaryParties": [
        {
          "name": "McCormick & Company, Incorporated",
          "role": "Strategic Collaboration Partner / FlavorPrint Services owner / Convertible Note investor",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Partner",
            "Investor",
            "Customer"
          ],
          "contact": {
            "address": "18 Loveton Circle, Sparks, Maryland 21152, USA"
          }
        },
        {
          "name": "Foodient Limited (trading as Whisk)",
          "role": "Service provider (Analysis/Consulting/Promotion services) / Collaboration counterparty / Note issuer",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "Birmingham Science Park, Aston Faraday Wharf, Holt Street, Birmingham, West Midlands B7 4BB, UK"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Stuart Renshaw",
          "role": "McCormick's initial appointed Representative under the joint decision-making framework",
          "appears_in": "Section 4(a) Appointment of Representatives"
        },
        {
          "name": "Nick Holzherr",
          "role": "Whisk's initial appointed Representative under the joint decision-making framework",
          "appears_in": "Section 4(a) Appointment of Representatives"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "10-eu-tm",
      "file": "10-EU TM.md",
      "title": "EU Trade Mark Registration Record (EUIPO/OHIM)",
      "category": "Trade Marks",
      "status": "executed",
      "statusNotes": "Registered EU trade mark; expiry date 2022-11-15 has passed without a recorded renewal in this extract — needs-attention for current validity.",
      "executionDate": "2013-04-18",
      "effectiveDate": "2012-11-15",
      "expiryDate": "2022-11-15",
      "governingLaw": "European Union (EUIPO/OHIM trade mark register)",
      "governingCourts": "",
      "primaryPartyName": "Forresters",
      "primaryPartyId": "forresters",
      "primaryParties": [
        {
          "name": "Foodient Ltd.",
          "role": "Trade mark owner / Applicant",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ],
          "contact": {
            "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Aston, Birmingham B7 4BB, GB"
          }
        },
        {
          "name": "Forresters",
          "role": "Representative (trade mark agent)",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Advisor"
          ],
          "contact": {
            "email": "OHIMCOMMSBIRMINGHAM@forresters.co.uk",
            "phone": "00 44-1212360484",
            "address": "Rutland House, 148 Edmund Street, Birmingham B3 2JA, GB"
          }
        }
      ],
      "otherNamedParties": [],
      "flags": [],
      "value": null
    },
    {
      "id": "11-employment-contract-oliver-mason",
      "file": "11-Employment Contract Oliver Mason.md",
      "title": "Employment Contract",
      "category": "Employment Contracts",
      "status": "needs-attention",
      "statusNotes": "Signature blocks present with typed names (Nick Holzherr for Foodient; Oliver Mason) but no actual signatures, dates, or witness details visible in the Markdown",
      "executionDate": "2013-12-01",
      "effectiveDate": "2013-12-01",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "exclusive courts of England and Wales",
      "primaryPartyName": "Oliver Mason",
      "primaryPartyId": "oliver-mason",
      "primaryParties": [
        {
          "name": "Foodient Limited",
          "role": "Employer",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham, B7 4BB (registered office; company number 08001091)"
          }
        },
        {
          "name": "Oliver Mason",
          "role": "Employee (Senior Developer)",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "57 Northfield Rd, Kings Norton, B30 1JD"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Nick Holzherr",
          "role": "CEO; signatory for Foodient Ltd",
          "appears_in": "Signature block as signing for and on behalf of Foodient Ltd"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "12-loan-note-certificate-final",
      "file": "12-Loan Note Certificate FINAL.md",
      "title": "Loan Note Certificate (form of certificate, Schedule 1)",
      "category": "Debt Finance",
      "status": "draft",
      "statusNotes": "Template form-of-certificate with all variable fields blank (certificate number, amount, holder name/address, board resolution date, instrument date, execution date, signatories, witness details).",
      "executionDate": "",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "England",
      "governingCourts": "",
      "primaryPartyName": "Foodient Limited",
      "primaryPartyId": "foodient-limited",
      "primaryParties": [
        {
          "name": "Foodient Limited",
          "role": "Issuer of unsecured convertible loan notes",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ]
        }
      ],
      "otherNamedParties": [],
      "flags": [],
      "value": null
    },
    {
      "id": "13-matthew-hines-employment-contract",
      "file": "13-Matthew Hines Employment Contract.md",
      "title": "Contract of Employment (section 1 ERA 1996 statement of terms)",
      "category": "Employment Contracts",
      "status": "needs-attention",
      "statusNotes": "Signature lines for Craig Edmunds (for Foodient) and Matthew Hines, plus the date line, are blank in the Markdown copy; execution cannot be confirmed from source.",
      "executionDate": "2012-11-12",
      "effectiveDate": "2012-11-12",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "",
      "primaryPartyName": "Matthew Hines",
      "primaryPartyId": "matthew-hines",
      "primaryParties": [
        {
          "name": "Foodient Limited",
          "role": "Employer",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ]
        },
        {
          "name": "Matthew Hines",
          "role": "Employee (Junior Developer)",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "9 Ash Grove, 139 Worcester Road, Malvern, WR14 1ET"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Craig Edmunds",
          "role": "Signatory for and on behalf of Foodient Limited; co-reporting line",
          "appears_in": "Signature block; reports-to in clause 2.1"
        },
        {
          "name": "Nick Holzherr",
          "role": "Co-reporting line for the employee",
          "appears_in": "Clause 2.1 (reports to)"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "14-mutual-nda-foodient-drjennykabir",
      "file": "14-Mutual_NDA_Foodient_DrJennyKabir.md",
      "title": "Mutual Confidentiality and Non-Disclosure Agreement",
      "category": "Confidentiality & Non-Disclosure Agreements",
      "status": "needs-attention",
      "statusNotes": "Date field blank at top; Foodient signature block names Nicolas Holzherr (Co-Founder) but no signature image is captured; Dr Jenny Kabir's signature/name/title lines are blank in the Markdown.",
      "executionDate": "",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "England",
      "governingCourts": "non-exclusive jurisdiction of the courts of England",
      "primaryPartyName": "Dr Jenny Kabir",
      "primaryPartyId": "dr-jenny-kabir",
      "primaryParties": [
        {
          "name": "Foodient Ltd.",
          "role": "Disclosing Party and Receiving Party (Mutual)",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "Faraday Wharf, Birmingham, B7 4BB (registered office); Company No. 08001091"
          }
        },
        {
          "name": "Dr Jenny Kabir",
          "role": "Disclosing Party and Receiving Party (Mutual)",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Advisor",
            "Partner"
          ]
        }
      ],
      "otherNamedParties": [
        {
          "name": "Nicolas Holzherr",
          "role": "Co-Founder, Foodient Ltd.",
          "appears_in": "Named on Foodient signature block"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "15-option-agreement-anthony-herron",
      "file": "15-Option Agreement Anthony Herron.md",
      "title": "EMI Share Option Agreement (executed as a deed)",
      "category": "Share Options",
      "status": "needs-attention",
      "statusNotes": "Document is styled as a deed and contains execution blocks for Foodient Ltd and Anthony Herron, but the Markdown shows blank signature, witness, and date fields; Date of Grant and \"DATED\" are not populated.",
      "executionDate": "",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "exclusive courts of England and Wales",
      "primaryPartyName": "Anthony Herron",
      "primaryPartyId": "anthony-herron",
      "primaryParties": [
        {
          "name": "Foodient Ltd",
          "role": "Company / Grantor of EMI option",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, West Midlands B7 4BB (company number 08001091)"
          }
        },
        {
          "name": "Anthony Herron",
          "role": "Option Holder (employee)",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "100 Highfield Road, Hall Green, Birmingham"
          }
        }
      ],
      "otherNamedParties": [],
      "flags": [],
      "value": null
    },
    {
      "id": "16-uk-tm",
      "file": "16-UK TM.md",
      "title": "Community Trade Mark Registration Record (EUIPO/OHIM register extract)",
      "category": "Trade Marks",
      "status": "executed",
      "statusNotes": "Register record showing trade mark in \"Registered\" status; not a contract requiring signature.",
      "executionDate": "2013-04-18",
      "effectiveDate": "2012-11-15",
      "expiryDate": "2022-11-15",
      "governingLaw": "",
      "governingCourts": "",
      "primaryPartyName": "Foodient Ltd.",
      "primaryPartyId": "foodient-ltd",
      "primaryParties": [
        {
          "name": "Foodient Ltd.",
          "role": "Trade mark holder / proprietor",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ],
          "contact": {
            "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street Aston, Birmingham, United Kingdom, B7 4BB"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "FORRESTERS",
          "role": "Representative (trade mark attorney/agent of record)",
          "appears_in": "Listed as Representative at Rutland House, 148 Edmund Street, Birmingham, B3 2JA"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "17-foodient-certificate-of-incorporation",
      "file": "17-Foodient_certificate_of_incorporation.md",
      "title": "Certificate of Incorporation (private company limited by shares)",
      "category": "Corporate",
      "status": "executed",
      "statusNotes": "Issued and authenticated electronically by the Registrar of Companies under s.1115 Companies Act 2006.",
      "executionDate": "2012-03-22",
      "effectiveDate": "2012-03-22",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "",
      "primaryPartyName": "Registrar of Companies for England and Wales (Companies House, Cardiff)",
      "primaryPartyId": "registrar-of-companies-for-england-and-wales-companies-house-cardiff",
      "primaryParties": [
        {
          "name": "Foodient Ltd.",
          "role": "Incorporated company (subject of the certificate)",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ]
        },
        {
          "name": "Registrar of Companies for England and Wales (Companies House, Cardiff)",
          "role": "Issuing authority",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Government"
          ]
        }
      ],
      "otherNamedParties": [],
      "flags": [],
      "value": null
    },
    {
      "id": "18-foodient-memorandum-of-association",
      "file": "18-Foodient_memorandum_of_association.md",
      "title": "Memorandum of Association",
      "category": "Corporate",
      "status": "executed",
      "statusNotes": "Both subscribers authenticated electronically on the dated date.",
      "executionDate": "2012-03-21",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "",
      "primaryPartyName": "Nick Holzherr",
      "primaryPartyId": "nick-holzherr",
      "primaryParties": [
        {
          "name": "Nick Holzherr",
          "role": "Subscriber / founding member",
          "is_user_company": false,
          "entity_type": "person",
          "organization": "Foodient Ltd.",
          "tags": [
            "Other"
          ]
        },
        {
          "name": "Craig Edmunds",
          "role": "Subscriber / founding member",
          "is_user_company": false,
          "entity_type": "person",
          "organization": "Foodient Ltd.",
          "tags": [
            "Other"
          ]
        },
        {
          "name": "Foodient Ltd.",
          "role": "Company being formed",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ]
        }
      ],
      "otherNamedParties": [],
      "flags": [],
      "value": null
    },
    {
      "id": "19-uk-tm-scan",
      "file": "19-UK TM scan.md",
      "title": "UK Trade Mark Registration Certificate",
      "category": "Trade Marks",
      "status": "executed",
      "statusNotes": "Registration certificate issued by the UK IPO; constitutes a granted registration record rather than a contract.",
      "executionDate": "2012-05-16",
      "effectiveDate": "2012-05-16",
      "expiryDate": "",
      "governingLaw": "United Kingdom (Trade Marks Act 1994)",
      "governingCourts": "",
      "primaryPartyName": "UK Intellectual Property Office (Trade Marks Registry)",
      "primaryPartyId": "uk-intellectual-property-office-trade-marks-registry",
      "primaryParties": [
        {
          "name": "Whisk (proprietor of mark)",
          "role": "Registered trade mark proprietor",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ]
        },
        {
          "name": "UK Intellectual Property Office (Trade Marks Registry)",
          "role": "Registering authority",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Government"
          ]
        }
      ],
      "otherNamedParties": [],
      "flags": [],
      "value": null
    },
    {
      "id": "20-mutual-nda-foodient-callcreditinformationgroup-complete",
      "file": "20-Mutual_NDA_Foodient_CallcreditInformationGroup_complete.md",
      "title": "Mutual Confidentiality and Non-Disclosure Agreement",
      "category": "Confidentiality & Non-Disclosure Agreements",
      "status": "executed",
      "statusNotes": "Both signature blocks show \"(signed)\" with named signatories; Callcredit signatory and title noted as handwritten.",
      "executionDate": "2012-07-10",
      "effectiveDate": "",
      "expiryDate": "2017-07-10",
      "governingLaw": "England",
      "governingCourts": "non-exclusive jurisdiction of the courts of England",
      "primaryPartyName": "Callcredit Marketing Limited",
      "primaryPartyId": "callcredit-marketing-limited",
      "primaryParties": [
        {
          "name": "Foodient Ltd.",
          "role": "Disclosing Party and Receiving Party (mutual)",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "Faraday Wharf, Birmingham, B7 4BB (Registered in England No. 08001091)"
          }
        },
        {
          "name": "Callcredit Marketing Limited",
          "role": "Disclosing Party and Receiving Party (mutual)",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Partner"
          ],
          "contact": {
            "address": "One Park Lane, Leeds, West Yorkshire, LS3 1EP (Registered in England No. 2733070)"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Nicolas Holzherr",
          "role": "Co-Founder, signatory for Foodient Ltd.",
          "appears_in": "Signature block for Foodient Ltd."
        },
        {
          "name": "Stewart Mortin",
          "role": "Commercial Director, signatory for Callcredit Marketing Limited",
          "appears_in": "Signature block for Callcredit Marketing Limited (handwritten name and title)"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "21-ealp-quasi-equity-jan-2013-1",
      "file": "21-EALP Quasi-Equity Jan 2013 1.md",
      "title": "Quasi-Equity Agreement (deed)",
      "category": "Debt Finance",
      "status": "needs-attention",
      "statusNotes": "Executed as a deed; EALP/Millpoint side signed (D J M Kerr, witness Bay Murror), but Foodient director signature line and execution date are blank.",
      "executionDate": "",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "exclusive English courts",
      "primaryPartyName": "Early Advantage Limited Partnership (acting by general partner Millpoint Limited)",
      "primaryPartyId": "early-advantage-limited-partnership-acting-by-general-partner-millpoint-limited",
      "primaryParties": [
        {
          "name": "Foodient Limited",
          "role": "Borrower / Company receiving quasi-equity advance",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ],
          "contact": {
            "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham B7 4BB (registered office; company no. 08001091)"
          }
        },
        {
          "name": "Early Advantage Limited Partnership (acting by general partner Millpoint Limited)",
          "role": "Lender / Quasi-equity provider",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Investor"
          ],
          "contact": {
            "address": "Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP (LP no. LP013679)"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Millpoint Limited",
          "role": "General partner of EALP, acting on its behalf",
          "appears_in": "Parties block and execution block"
        },
        {
          "name": "D J M Kerr",
          "role": "Director of Millpoint Limited",
          "appears_in": "Signed the deed for EALP/Millpoint"
        },
        {
          "name": "Bay Murror",
          "role": "Witness",
          "appears_in": "Witness to D J M Kerr's signature; address recorded as The Pantiles, Bobon Road, Wexford on Avon, Stafford upon Avon, Warwickshire CV37 8EY (handwritten, possibly garbled)"
        },
        {
          "name": "Fund Manager",
          "role": "Acts on behalf of EALP for exercising rights and receiving payments (entity not named in this document; defined by reference to Subscription Agreement)",
          "appears_in": "Clauses 2.4-2.5, 3.1.1, 3.2, 5.3"
        },
        {
          "name": "BCC / Managers / Private Investors",
          "role": "Other parties to the Subscription Agreement referenced in Recital (B)",
          "appears_in": "Recital B (definitions imported from Subscription Agreement)"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "22-foodient-ltd-2013-10-18-articles",
      "file": "22-Foodient Ltd. - 2013-10-18 - Articles.md",
      "title": "Articles of Association",
      "category": "Corporate Governance",
      "status": "executed",
      "statusNotes": "Articles state they were adopted by Written Resolution dated 12 September 2013; constitutional document on the public register.",
      "executionDate": "2013-09-12",
      "effectiveDate": "",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "",
      "primaryPartyName": "Foodient Ltd",
      "primaryPartyId": "foodient-ltd",
      "primaryParties": [
        {
          "name": "Foodient Ltd",
          "role": "Company (Issuer)",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ]
        }
      ],
      "otherNamedParties": [
        {
          "name": "Early Advantage Limited Partnership (EALP)",
          "role": "A\" ordinary shareholder / institutional investor referenced throughout (registered LP013679; acts by general partner Millpoint Limited)",
          "appears_in": "Defined term and recurring consent rights; party to Subscription Agreement"
        },
        {
          "name": "BCC",
          "role": "A\" ordinary shareholder / institutional investor referenced throughout",
          "appears_in": "Defined term and recurring consent rights; party to Subscription Agreement"
        },
        {
          "name": "Midven Limited",
          "role": "Party to Subscription Agreement (12 June 2012)",
          "appears_in": "Subscription Agreement definition (Article 2.1)"
        },
        {
          "name": "Millpoint Limited",
          "role": "General partner of EALP",
          "appears_in": "Subscription Agreement definition (Article 2.1)"
        }
      ],
      "flags": [],
      "value": null
    },
    {
      "id": "23-whisk-sub-agreement-12-june-2012",
      "file": "23-Whisk Sub Agreement - 12 June 2012.md",
      "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
      "category": "Pre-Seed & Seed Funding",
      "status": "executed",
      "statusNotes": "Executed as a deed by all parties; signatures shown for Foodient, both Managers, BCC (sealed), EALP via Millpoint, Midven, and all four Private Investors.",
      "executionDate": "2012-06-12",
      "effectiveDate": "2012-06-12",
      "expiryDate": "",
      "governingLaw": "England and Wales",
      "governingCourts": "exclusive jurisdiction of the courts of England",
      "primaryPartyName": "Birmingham City Council (BCC)",
      "primaryPartyId": "birmingham-city-council-bcc",
      "primaryParties": [
        {
          "name": "Foodient Limited",
          "role": "Company / Issuer of shares",
          "is_user_company": true,
          "entity_type": "organization",
          "tags": [
            "Other"
          ],
          "contact": {
            "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham B7 4BB"
          }
        },
        {
          "name": "Nick Holzherr",
          "role": "Manager / Director / Founder shareholder",
          "is_user_company": true,
          "entity_type": "person",
          "organization": "Foodient Limited",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "42A New Hampton Lofts, 90 Great Hampton Street, Birmingham B18 6UU"
          }
        },
        {
          "name": "Craig Edmunds",
          "role": "Manager / Director / Founder shareholder",
          "is_user_company": true,
          "entity_type": "person",
          "organization": "Foodient Limited",
          "tags": [
            "Employee"
          ],
          "contact": {
            "address": "Flat 1 Dock View Road, Barry, South Glamorgan CV63 4LQ"
          }
        },
        {
          "name": "Birmingham City Council (BCC)",
          "role": "Investor (holder of \"A\" Ordinary Shares)",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Investor",
            "Government"
          ],
          "contact": {
            "address": "The Council House, Victoria Square, Birmingham, West Midlands B1 1BB"
          }
        },
        {
          "name": "Early Advantage Limited Partnership (EALP)",
          "role": "Investor (holder of \"A\" Ordinary Shares); acts by its general partner Millpoint Limited",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Investor"
          ],
          "contact": {
            "address": "Second Floor, Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP"
          }
        },
        {
          "name": "Midven Limited",
          "role": "Fund Manager (manages EALP; recipient of arrangement, monitoring and exit fees)",
          "is_user_company": false,
          "entity_type": "organization",
          "tags": [
            "Investor",
            "Advisor"
          ],
          "contact": {
            "address": "Second Floor, Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP"
          }
        },
        {
          "name": "Peter Michael Dines",
          "role": "Private Investor / Non-executive director",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Investor"
          ],
          "contact": {
            "address": "4 Wentworth Road, Sutton Coldfield B74 2SG"
          }
        },
        {
          "name": "Nate Macleitch",
          "role": "Private Investor / Non-executive director",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Investor"
          ],
          "contact": {
            "address": "101 Dudley Gardens, London, W13 9LU"
          }
        },
        {
          "name": "Douglas Scott",
          "role": "Private Investor / Non-executive director",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Investor"
          ],
          "contact": {
            "address": "9 Friary Avenue, Lichfield, Staffs, WS13 6QQ"
          }
        },
        {
          "name": "Guy Morris",
          "role": "Private Investor (also party to a quasi-equity agreement)",
          "is_user_company": false,
          "entity_type": "person",
          "tags": [
            "Investor"
          ],
          "contact": {
            "address": "96 Eton Rise, Eton College Road, London NW2 2DB"
          }
        }
      ],
      "otherNamedParties": [
        {
          "name": "Millpoint Limited",
          "role": "General partner of EALP; signatory by D J M Kerr",
          "appears_in": "Party (4) acting on behalf of EALP"
        },
        {
          "name": "Finance Birmingham Limited (company number 07423867)",
          "role": "BCC's nominated agent for exercising rights under the Agreement",
          "appears_in": "Clause 1.12"
        },
        {
          "name": "D J M Kerr",
          "role": "Director of Millpoint Limited; signatory for EALP; witness for Midven and Guy Morris",
          "appears_in": "Execution block"
        },
        {
          "name": "Toby Harper",
          "role": "Witness to multiple signatures (Foodient, Holzherr, Edmunds, EALP, Dines)",
          "appears_in": "Execution block"
        },
        {
          "name": "Mark Warram",
          "role": "Witness to Nate Macleitch's signature",
          "appears_in": "Execution block"
        },
        {
          "name": "Paul Humphreys",
          "role": "Witness to Douglas Scott's signature",
          "appears_in": "Execution block"
        },
        {
          "name": "Shakespeares Legal LLP",
          "role": "Company solicitors (per Schedule 1)",
          "appears_in": "Schedule 1, Part 1"
        },
        {
          "name": "HSBC Bank Plc",
          "role": "Company bankers (per Schedule 1)",
          "appears_in": "Schedule 1, Part 1"
        }
      ],
      "flags": [],
      "value": null
    }
  ],
  "contacts": [
    {
      "id": "claire-louise-powell",
      "name": "Claire Louise Powell",
      "entityType": "person",
      "organization": "Foodient Ltd",
      "tags": [
        "Employee"
      ],
      "email": "",
      "phone": "",
      "address": "Farthings, Sheeplands Lane, Sherbourne, Dorset, DT9 4BW",
      "docs": [
        {
          "id": "04-option-agreement-template-claire-powell-v2",
          "title": "EMI Option Agreement (deed)",
          "status": "needs-attention",
          "category": "Share Options"
        },
        {
          "id": "08-120712-claire-powell-employment-contract",
          "title": "Employment Contract (Section 1 ERA 1996 statement)",
          "status": "needs-attention",
          "category": "Employment Contracts"
        }
      ],
      "initials": "CP",
      "avatarBg": "#CECBF6",
      "avatarColor": "#26215C",
      "fileCount": 2
    },
    {
      "id": "allrecipes-com-inc",
      "name": "Allrecipes.com, Inc.",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Partner"
      ],
      "email": "",
      "phone": "",
      "address": "413 Pine Street Suite 500, Seattle, WA 98101, USA",
      "docs": [
        {
          "id": "01-allrecipes-contract-final-2014-06-12",
          "title": "Licence Agreement (Widget integration and content licence)",
          "status": "executed",
          "category": "Intellectual Property Licensing"
        }
      ],
      "initials": "AI",
      "avatarBg": "#9FE1CB",
      "avatarColor": "#04342C",
      "fileCount": 1
    },
    {
      "id": "bbc-worldwide-limited",
      "name": "BBC Worldwide Limited",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Customer",
        "Partner"
      ],
      "email": "",
      "phone": "",
      "address": "Television Centre, 101 Wood Lane, London W12 7FA, UK",
      "docs": [
        {
          "id": "02-161121-whisk-bbc-gf",
          "title": "Whisk Publisher Agreement (Widget licence)",
          "status": "needs-attention",
          "category": "Intellectual Property Licensing"
        }
      ],
      "initials": "BL",
      "avatarBg": "#F5C4B3",
      "avatarColor": "#4A1B0C",
      "fileCount": 1
    },
    {
      "id": "milica-stojic",
      "name": "Milica Stojic",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Contractor"
      ],
      "email": "",
      "phone": "",
      "address": "Jove Maksina 26 a, 26000 Pancevo, Serbia",
      "docs": [
        {
          "id": "03-consultancy-agreement-milica-stojic",
          "title": "Consultancy Agreement (executed as a deed)",
          "status": "needs-attention",
          "category": "Service Agreements"
        }
      ],
      "initials": "MS",
      "avatarBg": "#F4C0D1",
      "avatarColor": "#4B1528",
      "fileCount": 1,
      "contextBody": "Engaged under a **Consultancy Agreement executed as a deed dated 12 March 2018** to deliver data/ontology management and development services for the Whisk smart food platform; primarily home-based; flexible hours; reports to Ruzica Miladinovic [source: 03-Consultancy agreement Milica Stojic.md]. Signature lines for both parties are blank in the Markdown copy — execution unconfirmed.\n\nCommercial:\n- Fee **$5/hour** (no VAT). Note typo in source (\"$5per hour\"); rate is unusually low and worth confirming [source: 03-Consultancy agreement Milica Stojic.md].\n- Monthly invoicing on last working day; payment within 14 days of invoice; UpWork or Payoneer permitted as alternative payment rails [source: 03-Consultancy agreement Milica Stojic.md].\n- Either party may terminate on **at least 2 weeks' written notice** [source: 03-Consultancy agreement Milica Stojic.md].\n\nAction surfaces:\n- **Anti-bribery compliance certification**: Consultant must certify in writing within 2 months of the agreement date and **annually thereafter**, with supporting evidence on request (clause 3.8.6) — recurring obligation [source: 03-Consultancy agreement Milica Stojic.md].\n- Incapacity threshold: Client may terminate immediately if Consultant is incapacitated for an aggregate 30 days in any 52-week period.\n\nRisks:\n- Consultant is in Serbia (outside UK/EEA): tax, data transfer and enforcement implications not specifically addressed in the contract.\n- **Data protection clause references DPA 1998 only**, with a blanket consent to non-EEA personal data transfers — likely non-compliant with UK GDPR if relied on today; consider DPA + IDTA/SCC top-up [source: 03-Consultancy agreement Milica Stojic.md].\n- Schedule cross-reference is malformed (Services defined as described in \"the 0 1.\").\n- Clause 3.1.2 \"devote at least 18 in each calendar month\" — unit (hours/days) missing.\n\nStrong terms favouring Foodient:\n- Full IP assignment of Works and Inventions (present + future), with moral-rights waiver, irrevocable power of attorney and IP indemnity backed by required liability insurance [source: 03-Consultancy agreement Milica Stojic.md].\n- Status indemnity for income tax, NICs and any worker-status / employment-related claim [source: 03-Consultancy agreement Milica Stojic.md].\n- Business Opportunities clause: first refusal to Foodient before offering elsewhere [source: 03-Consultancy agreement Milica Stojic.md].\n- No liability cap; Consultant has personal liability and broad indemnities.\n\nOpen questions:\n- Execution status of the deed.\n- Current engagement status.\n- Whether annual anti-bribery certifications have been completed.",
      "sources": [
        "03-Consultancy agreement Milica Stojic.md"
      ]
    },
    {
      "id": "great-british-chefs-ltd",
      "name": "Great British Chefs Ltd",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Partner"
      ],
      "email": "",
      "phone": "",
      "address": "72 Queen's Head Street, London, N1 8NG (registered office); Company No. 07470770",
      "docs": [
        {
          "id": "06-mutual-nda-foodient-greatbritishchefs",
          "title": "Mutual Non-Disclosure Agreement",
          "status": "needs-attention",
          "category": "Confidentiality & Non-Disclosure Agreements"
        }
      ],
      "initials": "GL",
      "avatarBg": "#B8DFEF",
      "avatarColor": "#0B3B58",
      "fileCount": 1
    },
    {
      "id": "recip-ly-ltd",
      "name": "Recip.ly Ltd.",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Partner"
      ],
      "email": "",
      "phone": "",
      "address": "Flat 1, 57 Dock View Road, Barry, Cardiff CF63 4LQ (Company No. 07341990)",
      "docs": [
        {
          "id": "07-mutual-nda-reciply-foodity",
          "title": "Mutual Non-Disclosure Agreement",
          "status": "needs-attention",
          "category": "Confidentiality & Non-Disclosure Agreements"
        }
      ],
      "initials": "RL",
      "avatarBg": "#F8E7A9",
      "avatarColor": "#4A3508",
      "fileCount": 1
    },
    {
      "id": "foodity-ltd",
      "name": "Foodity Ltd.",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Partner"
      ],
      "email": "",
      "phone": "",
      "address": "Suffolk House, George Street, Croydon, Surrey, CR0 0YN (Company No. 07139884)",
      "docs": [
        {
          "id": "07-mutual-nda-reciply-foodity",
          "title": "Mutual Non-Disclosure Agreement",
          "status": "needs-attention",
          "category": "Confidentiality & Non-Disclosure Agreements"
        }
      ],
      "initials": "FL",
      "avatarBg": "#CECBF6",
      "avatarColor": "#26215C",
      "fileCount": 1
    },
    {
      "id": "mccormick-company-incorporated",
      "name": "McCormick & Company, Incorporated",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Partner",
        "Investor",
        "Customer"
      ],
      "email": "",
      "phone": "",
      "address": "18 Loveton Circle, Sparks, Maryland 21152, USA",
      "docs": [
        {
          "id": "09-collaboration-agreement-whisk-mkc-final",
          "title": "Strategic Services and Collaboration Agreement",
          "status": "needs-attention",
          "category": "Joint Venture Agreements"
        }
      ],
      "initials": "MI",
      "avatarBg": "#9FE1CB",
      "avatarColor": "#04342C",
      "fileCount": 1
    },
    {
      "id": "forresters",
      "name": "Forresters",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Advisor"
      ],
      "email": "OHIMCOMMSBIRMINGHAM@forresters.co.uk",
      "phone": "00 44-1212360484",
      "address": "Rutland House, 148 Edmund Street, Birmingham B3 2JA, GB",
      "docs": [
        {
          "id": "10-eu-tm",
          "title": "EU Trade Mark Registration Record (EUIPO/OHIM)",
          "status": "executed",
          "category": "Trade Marks"
        }
      ],
      "initials": "FO",
      "avatarBg": "#F5C4B3",
      "avatarColor": "#4A1B0C",
      "fileCount": 1,
      "contextBody": "IP firm acting as Foodient's representative for the EU CTM (No. 011348001) and the corresponding UK register record for the \"Whisk\" word mark. Recorded change of name and professional address published 2013-04-29 (record 007424222) [source: 10-EU TM.md] [source: 16-UK TM.md].\n\nAction surface (high priority):\n- **Both EU and UK \"Whisk\" marks show expiry 15 November 2022 with no renewal recorded in the extracts**. Forresters is the natural first port of call to check the live position on the EUIPO and UK IPO registers (including post-Brexit comparable UK right handling) and, if necessary, to file a re-registration. EUTM renewals can be filed up to six months after expiry with a surcharge.",
      "sources": [
        "10-EU TM.md",
        "16-UK TM.md"
      ]
    },
    {
      "id": "oliver-mason",
      "name": "Oliver Mason",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Employee"
      ],
      "email": "",
      "phone": "",
      "address": "57 Northfield Rd, Kings Norton, B30 1JD",
      "docs": [
        {
          "id": "11-employment-contract-oliver-mason",
          "title": "Employment Contract",
          "status": "needs-attention",
          "category": "Employment Contracts"
        }
      ],
      "initials": "OM",
      "avatarBg": "#F4C0D1",
      "avatarColor": "#4B1528",
      "fileCount": 1,
      "contextBody": "Senior Developer; **commenced 1 December 2013**; salary £35,000 p.a. (paid monthly in arrears around 1st of month) [source: 11-Employment Contract Oliver Mason.md]. On the May 2014 org chart in the Tech team under CTO David Brooks [source: 05-Org Chart.md].\n\nContract is the most modern of the three employment contracts in the corpus and is the only one with **post-termination restrictive covenants**:\n- 12-month non-solicit/non-poach.\n- 6-month non-compete.\n- 6-month no-dealings with Restricted Customers.\n- Garden Leave reduces covenant periods one-for-one.\n- Cascade-poaching clause (6 months from last departure where 2+ Restricted Persons go to a competitor).\n\n[source: 11-Employment Contract Oliver Mason.md].\n\nMaterial drafting bugs to flag for any review/reuse:\n- Salary review \"first such review to take place prior to 1st January 2013\" pre-dates the 1 December 2013 Commencement Date — likely intended 1 January 2014 [source: 11-Employment Contract Oliver Mason.md].\n- Cross-references in clauses 15.3, 15.5, 15.7, 15.8, 15.9 say \"this clause 14.2\" but should refer to clause 15 [source: 11-Employment Contract Oliver Mason.md].\n- 16-week aggregate Incapacity in 52 weeks triggers summary termination right [source: 11-Employment Contract Oliver Mason.md].\n- Notices clause excludes email service [source: 11-Employment Contract Oliver Mason.md].\n- Pension: stakeholder access only, no employer contributions — pre-auto-enrolment [source: 11-Employment Contract Oliver Mason.md].\n\nConfidential Information defined to include business and product roadmaps, functional and technical specifications, source code, customer lists, price sheets — relevant for a developer role [source: 11-Employment Contract Oliver Mason.md].\n\nOpen questions:\n- Execution status (typed names but no signatures in corpus copy).\n- Current employment status.\n- IP assignment / inventions clause is not specifically addressed beyond the company-property language; consider whether a separate IP assignment exists.",
      "sources": [
        "05-Org Chart.md",
        "11-Employment Contract Oliver Mason.md"
      ]
    },
    {
      "id": "matthew-hines",
      "name": "Matthew Hines",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Employee"
      ],
      "email": "",
      "phone": "",
      "address": "9 Ash Grove, 139 Worcester Road, Malvern, WR14 1ET",
      "docs": [
        {
          "id": "13-matthew-hines-employment-contract",
          "title": "Contract of Employment (section 1 ERA 1996 statement of terms)",
          "status": "needs-attention",
          "category": "Employment Contracts"
        }
      ],
      "initials": "MH",
      "avatarBg": "#B8DFEF",
      "avatarColor": "#0B3B58",
      "fileCount": 1,
      "contextBody": "Junior Developer; **commenced 12 November 2012**; salary £12,000 p.a. (apprentice/junior level for the time) [source: 13-Matthew Hines Employment Contract.md]. Place of work: \"Whisk, Tech Tropicana, 8 Venture Way, Birmingham B7 4AP\". Co-reporting line at start: Nick Holzherr and Craig Edmunds [source: 13-Matthew Hines Employment Contract.md]. On the May 2014 org chart as Junior developer under CTO David Brooks [source: 05-Org Chart.md].\n\nContract was signed for Foodient by **Craig Edmunds** (one of the few corpus instances of a Foodient signature by someone other than Holzherr) [source: 13-Matthew Hines Employment Contract.md].\n\nNotable contract gaps:\n- No post-termination restrictive covenants, no express IP assignment beyond company-property language, no governing-law/jurisdiction clause.\n- Several un-finalised template artefacts (\"[one calendar month's]\", \"[full-time equivalent]\", \"[not]\" in pension clause) suggesting the document went out before all template optionals were resolved [source: 13-Matthew Hines Employment Contract.md].\n- Pre-auto-enrolment pension drafting.\n\nOpen questions:\n- Execution status (signature/date lines blank in corpus copy).\n- Current employment status.",
      "sources": [
        "05-Org Chart.md",
        "13-Matthew Hines Employment Contract.md"
      ]
    },
    {
      "id": "dr-jenny-kabir",
      "name": "Dr Jenny Kabir",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Advisor",
        "Partner"
      ],
      "email": "",
      "phone": "",
      "address": "",
      "docs": [
        {
          "id": "14-mutual-nda-foodient-drjennykabir",
          "title": "Mutual Confidentiality and Non-Disclosure Agreement",
          "status": "needs-attention",
          "category": "Confidentiality & Non-Disclosure Agreements"
        }
      ],
      "initials": "DK",
      "avatarBg": "#F8E7A9",
      "avatarColor": "#4A3508",
      "fileCount": 1
    },
    {
      "id": "anthony-herron",
      "name": "Anthony Herron",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Employee"
      ],
      "email": "",
      "phone": "",
      "address": "100 Highfield Road, Hall Green, Birmingham",
      "docs": [
        {
          "id": "15-option-agreement-anthony-herron",
          "title": "EMI Share Option Agreement (executed as a deed)",
          "status": "needs-attention",
          "category": "Share Options"
        }
      ],
      "initials": "AH",
      "avatarBg": "#CECBF6",
      "avatarColor": "#26215C",
      "fileCount": 1,
      "contextBody": "Holds an **EMI Option Agreement (deed) over 18,391 ordinary shares** of £0.00001 nominal at £0.01 exercise price under the Foodient Ltd EMI Share Option Plan [source: 15-Option Agreement Anthony Herron.md].\n\nTranche structure (event-driven exercisability gated by an Exercise Event under Rules 11.1–11.4 or termination notice >=5 days before actual termination):\n- 12,260 shares from 25 November 2013.\n- 6,131 shares from 25 November 2014.\n\n[source: 15-Option Agreement Anthony Herron.md].\n\n**Execution risk**: \"DATED\" line, Date of Grant, signature/witness blocks all blank in the corpus copy. Plus the deed and EMI Notice must be returned within 30 days of Date of Grant or the Option lapses (clause 2.3) [source: 15-Option Agreement Anthony Herron.md].\n\nPre-agreed **Good Leaver** with retention cap of up to 15% of issued share capital (non-voting) per Article 7 of the Articles [source: 15-Option Agreement Anthony Herron.md].\n\nNo employment contract for Anthony Herron is in the corpus. Not on the May 2014 org chart — confirm whether he was an employee at any point.\n\nOpen questions:\n- Whether the EMI option deed was actually executed and the EMI Notice filed in the 30-day window.\n- Whether he was/is an employee (EMI status depends on this).\n- Current shareholding / vesting position.",
      "sources": [
        "15-Option Agreement Anthony Herron.md"
      ]
    },
    {
      "id": "registrar-of-companies-for-england-and-wales-companies-house-cardiff",
      "name": "Registrar of Companies for England and Wales (Companies House, Cardiff)",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Government"
      ],
      "email": "",
      "phone": "",
      "address": "",
      "docs": [
        {
          "id": "17-foodient-certificate-of-incorporation",
          "title": "Certificate of Incorporation (private company limited by shares)",
          "status": "executed",
          "category": "Corporate"
        }
      ],
      "initials": "RW",
      "avatarBg": "#9FE1CB",
      "avatarColor": "#04342C",
      "fileCount": 1
    },
    {
      "id": "nick-holzherr",
      "name": "Nick Holzherr",
      "entityType": "person",
      "organization": "Foodient Ltd.",
      "tags": [
        "Other"
      ],
      "email": "",
      "phone": "",
      "address": "",
      "docs": [
        {
          "id": "18-foodient-memorandum-of-association",
          "title": "Memorandum of Association",
          "status": "executed",
          "category": "Corporate"
        }
      ],
      "initials": "NH",
      "avatarBg": "#F5C4B3",
      "avatarColor": "#4A1B0C",
      "fileCount": 1,
      "contextBody": "Founder-CEO and the recurring counter-signatory for Foodient on virtually every contract in the corpus, including the two licensing deals (Allrecipes 2014, BBC Good Food 2016), the McCormick Strategic Services and Collaboration Agreement (where he is Whisk's appointed Representative for joint decision-making), the Stojic consultancy deed, the Powell, Mason and Hines employment contracts, and three of the four NDAs. Originally signed early NDAs as \"Co-Founder\" of Foodient (and once as Co-Founder of \"Recip.ly Ltd.\" in the Reciply/Foodity NDA — the same individual, different entity).\n\nFounder shareholder under the seed Subscription Agreement (33.52% post-Completion) and subject of a £500,000 keyman insurance policy that was to be in place within 6 weeks of 12 June 2012 Completion [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n\nManager under the Subscription Agreement, so subject to:\n- 18-month post-Cessation non-compete and non-solicit of staff/suppliers; 12-month non-solicit of customers (clause 7) [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- Manager warranty cap of £35,000 in the seed round [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- Bad/Good Leaver vesting framework in the Articles, vesting from the date of his Service Agreement (Service Agreement itself not in corpus) [source: 22-Foodient Ltd. - 2013-10-18 - Articles.md].\n\nPractical use:\n- Default signatory and notice contact for Foodient/Whisk.\n- Single point of contact for any cap-table / leaver-status / option-grant decisions on the founder side.\n- For McCormick collaboration matters, he is the Whisk Representative whose written consent (or replacement) is required for material Collaboration decisions and for the renewal-30-days-before-expiry mechanic [source: 09-Collaboration Agreement Whisk & MKC FINAL.md].\n\nOpen questions:\n- Current Foodient/Whisk role and shareholding post-2014 (corpus stops in 2018 with the Stojic deed).\n- Whether the £500k keyman policy is still in force.",
      "sources": [
        "01-Allrecipes Contract - FINAL 2014-06-12.md",
        "02-161121 Whisk BBC GF.md",
        "03-Consultancy agreement Milica Stojic.md",
        "05-Org Chart.md",
        "06-Mutual_NDA_Foodient_GreatBritishChefs.md",
        "07-Mutual_NDA_Reciply_Foodity.md",
        "08-120712 Claire Powell Employment Contract.md",
        "09-Collaboration Agreement Whisk & MKC FINAL.md",
        "11-Employment Contract Oliver Mason.md",
        "14-Mutual_NDA_Foodient_DrJennyKabir.md",
        "18-Foodient_memorandum_of_association.md",
        "20-Mutual_NDA_Foodient_CallcreditInformationGroup_complete.md",
        "23-Whisk Sub Agreement - 12 June 2012.md"
      ]
    },
    {
      "id": "craig-edmunds",
      "name": "Craig Edmunds",
      "entityType": "person",
      "organization": "Foodient Ltd.",
      "tags": [
        "Other"
      ],
      "email": "",
      "phone": "",
      "address": "",
      "docs": [
        {
          "id": "18-foodient-memorandum-of-association",
          "title": "Memorandum of Association",
          "status": "executed",
          "category": "Corporate"
        }
      ],
      "initials": "CE",
      "avatarBg": "#F4C0D1",
      "avatarColor": "#4B1528",
      "fileCount": 1,
      "contextBody": "Co-founder and one of the two original subscribers on the Memorandum of Association (21 March 2012) [source: 18-Foodient_memorandum_of_association.md]. Manager under the Subscription Agreement (33.52% post-Completion) [source: 23-Whisk Sub Agreement - 12 June 2012.md]. Subject of £150,000 keyman insurance under clause 5.6 of that agreement [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n\nAssigned the **recipe-application source-code IP** to Foodient at Completion in exchange for **six monthly payments of £750**, starting on the last Business Day of the third month after Completion (clause 5.4) [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n\nSigned the Matthew Hines employment contract on 12 November 2012 for and on behalf of Foodient Limited; also listed as a co-reporting line for Hines [source: 13-Matthew Hines Employment Contract.md].\n\n**Status uncertainty**: not present on the May 2014 org chart; corpus contains no later mention. He is also named as Co-Founder of \"Recip.ly Ltd.\" in a March 2012 mutual NDA — separate entity, treated here as background context for his pre-Foodient activity (the Reciply NDA was signed by Holzherr as Co-Founder of Recip.ly, not Edmunds; Edmunds is not an Reciply signatory in the corpus).\n\nManager-level obligations that may still bind him if he is treated as a Cessation Manager:\n- 18-month non-compete + 12-month customer non-solicit + 18-month staff/supplier non-solicit from Cessation [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n- Bad Leaver default if he resigned within first 12 months of his Service Agreement; vesting governed by Articles 7.4–7.10 [source: 22-Foodient Ltd. - 2013-10-18 - Articles.md].\n\nOpen questions (high priority for any cap-table or governance review):\n- Date and circumstances of departure from the Foodient board / executive team.\n- Good vs Bad Leaver classification and vested-share position at Cessation.\n- Whether the £150k keyman policy was cancelled or transferred.\n- Whether the six £750 IP-payment instalments were completed.",
      "sources": [
        "13-Matthew Hines Employment Contract.md",
        "18-Foodient_memorandum_of_association.md",
        "23-Whisk Sub Agreement - 12 June 2012.md"
      ]
    },
    {
      "id": "uk-intellectual-property-office-trade-marks-registry",
      "name": "UK Intellectual Property Office (Trade Marks Registry)",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Government"
      ],
      "email": "",
      "phone": "",
      "address": "",
      "docs": [
        {
          "id": "19-uk-tm-scan",
          "title": "UK Trade Mark Registration Certificate",
          "status": "executed",
          "category": "Trade Marks"
        }
      ],
      "initials": "UO",
      "avatarBg": "#B8DFEF",
      "avatarColor": "#0B3B58",
      "fileCount": 1
    },
    {
      "id": "callcredit-marketing-limited",
      "name": "Callcredit Marketing Limited",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Partner"
      ],
      "email": "",
      "phone": "",
      "address": "One Park Lane, Leeds, West Yorkshire, LS3 1EP (Registered in England No. 2733070)",
      "docs": [
        {
          "id": "20-mutual-nda-foodient-callcreditinformationgroup-complete",
          "title": "Mutual Confidentiality and Non-Disclosure Agreement",
          "status": "executed",
          "category": "Confidentiality & Non-Disclosure Agreements"
        }
      ],
      "initials": "CL",
      "avatarBg": "#F8E7A9",
      "avatarColor": "#4A3508",
      "fileCount": 1
    },
    {
      "id": "early-advantage-limited-partnership-acting-by-general-partner-millpoint-limited",
      "name": "Early Advantage Limited Partnership (acting by general partner Millpoint Limited)",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Investor"
      ],
      "email": "",
      "phone": "",
      "address": "Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP (LP no. LP013679)",
      "docs": [
        {
          "id": "21-ealp-quasi-equity-jan-2013-1",
          "title": "Quasi-Equity Agreement (deed)",
          "status": "needs-attention",
          "category": "Debt Finance"
        }
      ],
      "initials": "EP",
      "avatarBg": "#CECBF6",
      "avatarColor": "#26215C",
      "fileCount": 1
    },
    {
      "id": "birmingham-city-council-bcc",
      "name": "Birmingham City Council (BCC)",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Investor",
        "Government"
      ],
      "email": "",
      "phone": "",
      "address": "The Council House, Victoria Square, Birmingham, West Midlands B1 1BB",
      "docs": [
        {
          "id": "23-whisk-sub-agreement-12-june-2012",
          "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
          "status": "executed",
          "category": "Pre-Seed & Seed Funding"
        }
      ],
      "initials": "BC",
      "avatarBg": "#9FE1CB",
      "avatarColor": "#04342C",
      "fileCount": 1
    },
    {
      "id": "early-advantage-limited-partnership-ealp",
      "name": "Early Advantage Limited Partnership (EALP)",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Investor"
      ],
      "email": "",
      "phone": "",
      "address": "Second Floor, Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP",
      "docs": [
        {
          "id": "23-whisk-sub-agreement-12-june-2012",
          "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
          "status": "executed",
          "category": "Pre-Seed & Seed Funding"
        }
      ],
      "initials": "EP",
      "avatarBg": "#F5C4B3",
      "avatarColor": "#4A1B0C",
      "fileCount": 1
    },
    {
      "id": "midven-limited",
      "name": "Midven Limited",
      "entityType": "organization",
      "organization": "",
      "tags": [
        "Investor",
        "Advisor"
      ],
      "email": "",
      "phone": "",
      "address": "Second Floor, Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP",
      "docs": [
        {
          "id": "23-whisk-sub-agreement-12-june-2012",
          "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
          "status": "executed",
          "category": "Pre-Seed & Seed Funding"
        }
      ],
      "initials": "ML",
      "avatarBg": "#F4C0D1",
      "avatarColor": "#4B1528",
      "fileCount": 1,
      "contextBody": "Acts as **Fund Manager** to EALP and is the operational point of contact for all EALP rights, including notices, payments, consents and audit rights [source: 21-EALP Quasi-Equity Jan 2013 1.md] [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n\nHolds a **board observer seat** at Foodient (held by Duncan Kerr per the May 2014 org chart) [source: 05-Org Chart.md].\n\nRecurring fee structure under the Subscription Agreement:\n- Arrangement fee £749.90 + VAT at Completion.\n- **Monthly monitoring fee £62.50 + VAT** (paid by standing order, on the 25th of each month).\n- 3% arrangement fee on follow-on EALP investments.\n- 4% exit fee on EALP sale (mandatory) [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n\nPractical use:\n- Default notice destination for all EALP communications (consents, defaults, repayments, audits).\n- D J M Kerr (a director of Millpoint Limited) is the recurring signatory on the EALP/Millpoint side; Duncan Kerr (likely the same person) is Midven's board observer.\n\nOpen questions:\n- Reconcile \"D J M Kerr\" (Millpoint director / signatory) and \"Duncan Kerr\" (Midven observer) — almost certainly the same individual but spelt differently in different documents.",
      "sources": [
        "05-Org Chart.md",
        "21-EALP Quasi-Equity Jan 2013 1.md",
        "23-Whisk Sub Agreement - 12 June 2012.md"
      ]
    },
    {
      "id": "peter-michael-dines",
      "name": "Peter Michael Dines",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Investor"
      ],
      "email": "",
      "phone": "",
      "address": "4 Wentworth Road, Sutton Coldfield B74 2SG",
      "docs": [
        {
          "id": "23-whisk-sub-agreement-12-june-2012",
          "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
          "status": "executed",
          "category": "Pre-Seed & Seed Funding"
        }
      ],
      "initials": "PD",
      "avatarBg": "#B8DFEF",
      "avatarColor": "#0B3B58",
      "fileCount": 1
    },
    {
      "id": "nate-macleitch",
      "name": "Nate Macleitch",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Investor"
      ],
      "email": "",
      "phone": "",
      "address": "101 Dudley Gardens, London, W13 9LU",
      "docs": [
        {
          "id": "23-whisk-sub-agreement-12-june-2012",
          "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
          "status": "executed",
          "category": "Pre-Seed & Seed Funding"
        }
      ],
      "initials": "NM",
      "avatarBg": "#F8E7A9",
      "avatarColor": "#4A3508",
      "fileCount": 1,
      "contextBody": "Private Investor under the 12 June 2012 Subscription Agreement (subscribed £12,498.26, plus £12,498.26 quasi-equity loan; 5.68% post-Completion) and appointed an NED at Completion [source: 23-Whisk Sub Agreement - 12 June 2012.md]. Recorded as a board member on the May 2014 org chart (spelled \"Nate MacLeitch\") [source: 05-Org Chart.md].\n\nSurname spelling differs: Subscription Agreement and execution block use \"Macleitch\"; the org chart uses \"MacLeitch\". Treat as the same person.\n\nOpen questions:\n- Current shareholding and board status post-2014.\n- Whether the quasi-equity loan portion has been repaid.",
      "sources": [
        "05-Org Chart.md",
        "23-Whisk Sub Agreement - 12 June 2012.md"
      ]
    },
    {
      "id": "douglas-scott",
      "name": "Douglas Scott",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Investor"
      ],
      "email": "",
      "phone": "",
      "address": "9 Friary Avenue, Lichfield, Staffs, WS13 6QQ",
      "docs": [
        {
          "id": "23-whisk-sub-agreement-12-june-2012",
          "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
          "status": "executed",
          "category": "Pre-Seed & Seed Funding"
        }
      ],
      "initials": "DS",
      "avatarBg": "#CECBF6",
      "avatarColor": "#26215C",
      "fileCount": 1,
      "contextBody": "Private Investor under the 12 June 2012 Subscription Agreement; subscribed £24,996.52 (5.68% post-Completion); appointed an NED at Completion [source: 23-Whisk Sub Agreement - 12 June 2012.md].\n\nNot on the 20 May 2014 org chart, although that document only lists \"Peter Dines\" and \"Nate MacLeitch\" alongside the executives — Scott's absence from the chart is not necessarily a sign of departure.\n\nOpen questions:\n- Whether Scott was still a director / NED in 2014 onwards.\n- Current shareholding.",
      "sources": [
        "23-Whisk Sub Agreement - 12 June 2012.md"
      ]
    },
    {
      "id": "guy-morris",
      "name": "Guy Morris",
      "entityType": "person",
      "organization": "",
      "tags": [
        "Investor"
      ],
      "email": "",
      "phone": "",
      "address": "96 Eton Rise, Eton College Road, London NW2 2DB",
      "docs": [
        {
          "id": "23-whisk-sub-agreement-12-june-2012",
          "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
          "status": "executed",
          "category": "Pre-Seed & Seed Funding"
        }
      ],
      "initials": "GM",
      "avatarBg": "#9FE1CB",
      "avatarColor": "#04342C",
      "fileCount": 1,
      "contextBody": "Private Investor at Completion: £10,000 ordinary share subscription plus a matched £10,000 quasi-equity loan; 2.32% post-Completion [source: 23-Whisk Sub Agreement - 12 June 2012.md]. Not appointed as an NED.\n\nDistinct from EALP/BCC quasi-equity: Morris is the only Private Investor who also signed a Quasi-Equity Agreement, alongside the same-form EALP and BCC instruments.\n\nOpen questions:\n- Whether his £10k quasi-equity loan has been repaid.\n- Current shareholding.",
      "sources": [
        "23-Whisk Sub Agreement - 12 June 2012.md"
      ]
    }
  ],
  "statusGroups": {
    "draft": [
      {
        "id": "12-loan-note-certificate-final",
        "file": "12-Loan Note Certificate FINAL.md",
        "title": "Loan Note Certificate (form of certificate, Schedule 1)",
        "category": "Debt Finance",
        "status": "draft",
        "statusNotes": "Template form-of-certificate with all variable fields blank (certificate number, amount, holder name/address, board resolution date, instrument date, execution date, signatories, witness details).",
        "executionDate": "",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "England",
        "governingCourts": "",
        "primaryPartyName": "Foodient Limited",
        "primaryPartyId": "foodient-limited",
        "primaryParties": [
          {
            "name": "Foodient Limited",
            "role": "Issuer of unsecured convertible loan notes",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ]
          }
        ],
        "otherNamedParties": [],
        "flags": [],
        "value": null
      }
    ],
    "under-review": [],
    "executed": [
      {
        "id": "01-allrecipes-contract-final-2014-06-12",
        "file": "01-Allrecipes Contract - FINAL 2014-06-12.md",
        "title": "Licence Agreement (Widget integration and content licence)",
        "category": "Intellectual Property Licensing",
        "status": "executed",
        "statusNotes": "Both signature blocks show signed names (Patricia Smith for Allrecipes; Nick Holzherr for Foodient). \"(signed)\" annotation only appears next to Allrecipes signatory.",
        "executionDate": "2014-06-12",
        "effectiveDate": "2014-06-12",
        "expiryDate": "",
        "governingLaw": "England",
        "governingCourts": "exclusive English courts",
        "primaryPartyName": "Allrecipes.com, Inc.",
        "primaryPartyId": "allrecipes-com-inc",
        "primaryParties": [
          {
            "name": "Allrecipes.com, Inc.",
            "role": "Licensor (Sites operator and Content proprietor)",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "413 Pine Street Suite 500, Seattle, WA 98101, USA"
            }
          },
          {
            "name": "Foodient Ltd",
            "role": "Licensee / Platform operator (referred to as \"Whisk\")",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "email": "tech@whisk.co.uk",
              "address": "c/o Nick Holzherr, Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham B7 4BB (company no. 8001091)"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Patricia Smith",
            "role": "Director, signing for Allrecipes.com, Inc.",
            "appears_in": "Signature block"
          },
          {
            "name": "Nick Holzherr",
            "role": "Director, signing for Foodient Ltd",
            "appears_in": "Signature block; also named in Foodient registered office address"
          },
          {
            "name": "Lakeland Limited",
            "role": "Excluded counterparty carve-out from exclusivity (Alexandra Buildings, Windermere, Cumbria, LA23 1BQ)",
            "appears_in": "Clause 8.2"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "05-org-chart",
        "file": "05-Org Chart.md",
        "title": "Internal Org Chart",
        "category": "Other",
        "status": "executed",
        "statusNotes": "Informational snapshot dated 20 May 2014; not a contract requiring signature.",
        "executionDate": "",
        "effectiveDate": "2014-05-20",
        "expiryDate": "",
        "governingLaw": "",
        "governingCourts": "",
        "primaryPartyName": "Foodient (Whisk)",
        "primaryPartyId": "foodient-whisk",
        "primaryParties": [
          {
            "name": "Foodient (Whisk)",
            "role": "Subject company (org chart owner)",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ]
          }
        ],
        "otherNamedParties": [],
        "flags": [],
        "value": null
      },
      {
        "id": "10-eu-tm",
        "file": "10-EU TM.md",
        "title": "EU Trade Mark Registration Record (EUIPO/OHIM)",
        "category": "Trade Marks",
        "status": "executed",
        "statusNotes": "Registered EU trade mark; expiry date 2022-11-15 has passed without a recorded renewal in this extract — needs-attention for current validity.",
        "executionDate": "2013-04-18",
        "effectiveDate": "2012-11-15",
        "expiryDate": "2022-11-15",
        "governingLaw": "European Union (EUIPO/OHIM trade mark register)",
        "governingCourts": "",
        "primaryPartyName": "Forresters",
        "primaryPartyId": "forresters",
        "primaryParties": [
          {
            "name": "Foodient Ltd.",
            "role": "Trade mark owner / Applicant",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ],
            "contact": {
              "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Aston, Birmingham B7 4BB, GB"
            }
          },
          {
            "name": "Forresters",
            "role": "Representative (trade mark agent)",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Advisor"
            ],
            "contact": {
              "email": "OHIMCOMMSBIRMINGHAM@forresters.co.uk",
              "phone": "00 44-1212360484",
              "address": "Rutland House, 148 Edmund Street, Birmingham B3 2JA, GB"
            }
          }
        ],
        "otherNamedParties": [],
        "flags": [],
        "value": null
      },
      {
        "id": "16-uk-tm",
        "file": "16-UK TM.md",
        "title": "Community Trade Mark Registration Record (EUIPO/OHIM register extract)",
        "category": "Trade Marks",
        "status": "executed",
        "statusNotes": "Register record showing trade mark in \"Registered\" status; not a contract requiring signature.",
        "executionDate": "2013-04-18",
        "effectiveDate": "2012-11-15",
        "expiryDate": "2022-11-15",
        "governingLaw": "",
        "governingCourts": "",
        "primaryPartyName": "Foodient Ltd.",
        "primaryPartyId": "foodient-ltd",
        "primaryParties": [
          {
            "name": "Foodient Ltd.",
            "role": "Trade mark holder / proprietor",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ],
            "contact": {
              "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street Aston, Birmingham, United Kingdom, B7 4BB"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "FORRESTERS",
            "role": "Representative (trade mark attorney/agent of record)",
            "appears_in": "Listed as Representative at Rutland House, 148 Edmund Street, Birmingham, B3 2JA"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "17-foodient-certificate-of-incorporation",
        "file": "17-Foodient_certificate_of_incorporation.md",
        "title": "Certificate of Incorporation (private company limited by shares)",
        "category": "Corporate",
        "status": "executed",
        "statusNotes": "Issued and authenticated electronically by the Registrar of Companies under s.1115 Companies Act 2006.",
        "executionDate": "2012-03-22",
        "effectiveDate": "2012-03-22",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "",
        "primaryPartyName": "Registrar of Companies for England and Wales (Companies House, Cardiff)",
        "primaryPartyId": "registrar-of-companies-for-england-and-wales-companies-house-cardiff",
        "primaryParties": [
          {
            "name": "Foodient Ltd.",
            "role": "Incorporated company (subject of the certificate)",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ]
          },
          {
            "name": "Registrar of Companies for England and Wales (Companies House, Cardiff)",
            "role": "Issuing authority",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Government"
            ]
          }
        ],
        "otherNamedParties": [],
        "flags": [],
        "value": null
      },
      {
        "id": "18-foodient-memorandum-of-association",
        "file": "18-Foodient_memorandum_of_association.md",
        "title": "Memorandum of Association",
        "category": "Corporate",
        "status": "executed",
        "statusNotes": "Both subscribers authenticated electronically on the dated date.",
        "executionDate": "2012-03-21",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "",
        "primaryPartyName": "Nick Holzherr",
        "primaryPartyId": "nick-holzherr",
        "primaryParties": [
          {
            "name": "Nick Holzherr",
            "role": "Subscriber / founding member",
            "is_user_company": false,
            "entity_type": "person",
            "organization": "Foodient Ltd.",
            "tags": [
              "Other"
            ]
          },
          {
            "name": "Craig Edmunds",
            "role": "Subscriber / founding member",
            "is_user_company": false,
            "entity_type": "person",
            "organization": "Foodient Ltd.",
            "tags": [
              "Other"
            ]
          },
          {
            "name": "Foodient Ltd.",
            "role": "Company being formed",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ]
          }
        ],
        "otherNamedParties": [],
        "flags": [],
        "value": null
      },
      {
        "id": "19-uk-tm-scan",
        "file": "19-UK TM scan.md",
        "title": "UK Trade Mark Registration Certificate",
        "category": "Trade Marks",
        "status": "executed",
        "statusNotes": "Registration certificate issued by the UK IPO; constitutes a granted registration record rather than a contract.",
        "executionDate": "2012-05-16",
        "effectiveDate": "2012-05-16",
        "expiryDate": "",
        "governingLaw": "United Kingdom (Trade Marks Act 1994)",
        "governingCourts": "",
        "primaryPartyName": "UK Intellectual Property Office (Trade Marks Registry)",
        "primaryPartyId": "uk-intellectual-property-office-trade-marks-registry",
        "primaryParties": [
          {
            "name": "Whisk (proprietor of mark)",
            "role": "Registered trade mark proprietor",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ]
          },
          {
            "name": "UK Intellectual Property Office (Trade Marks Registry)",
            "role": "Registering authority",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Government"
            ]
          }
        ],
        "otherNamedParties": [],
        "flags": [],
        "value": null
      },
      {
        "id": "20-mutual-nda-foodient-callcreditinformationgroup-complete",
        "file": "20-Mutual_NDA_Foodient_CallcreditInformationGroup_complete.md",
        "title": "Mutual Confidentiality and Non-Disclosure Agreement",
        "category": "Confidentiality & Non-Disclosure Agreements",
        "status": "executed",
        "statusNotes": "Both signature blocks show \"(signed)\" with named signatories; Callcredit signatory and title noted as handwritten.",
        "executionDate": "2012-07-10",
        "effectiveDate": "",
        "expiryDate": "2017-07-10",
        "governingLaw": "England",
        "governingCourts": "non-exclusive jurisdiction of the courts of England",
        "primaryPartyName": "Callcredit Marketing Limited",
        "primaryPartyId": "callcredit-marketing-limited",
        "primaryParties": [
          {
            "name": "Foodient Ltd.",
            "role": "Disclosing Party and Receiving Party (mutual)",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "Faraday Wharf, Birmingham, B7 4BB (Registered in England No. 08001091)"
            }
          },
          {
            "name": "Callcredit Marketing Limited",
            "role": "Disclosing Party and Receiving Party (mutual)",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "One Park Lane, Leeds, West Yorkshire, LS3 1EP (Registered in England No. 2733070)"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Nicolas Holzherr",
            "role": "Co-Founder, signatory for Foodient Ltd.",
            "appears_in": "Signature block for Foodient Ltd."
          },
          {
            "name": "Stewart Mortin",
            "role": "Commercial Director, signatory for Callcredit Marketing Limited",
            "appears_in": "Signature block for Callcredit Marketing Limited (handwritten name and title)"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "22-foodient-ltd-2013-10-18-articles",
        "file": "22-Foodient Ltd. - 2013-10-18 - Articles.md",
        "title": "Articles of Association",
        "category": "Corporate Governance",
        "status": "executed",
        "statusNotes": "Articles state they were adopted by Written Resolution dated 12 September 2013; constitutional document on the public register.",
        "executionDate": "2013-09-12",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "",
        "primaryPartyName": "Foodient Ltd",
        "primaryPartyId": "foodient-ltd",
        "primaryParties": [
          {
            "name": "Foodient Ltd",
            "role": "Company (Issuer)",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ]
          }
        ],
        "otherNamedParties": [
          {
            "name": "Early Advantage Limited Partnership (EALP)",
            "role": "A\" ordinary shareholder / institutional investor referenced throughout (registered LP013679; acts by general partner Millpoint Limited)",
            "appears_in": "Defined term and recurring consent rights; party to Subscription Agreement"
          },
          {
            "name": "BCC",
            "role": "A\" ordinary shareholder / institutional investor referenced throughout",
            "appears_in": "Defined term and recurring consent rights; party to Subscription Agreement"
          },
          {
            "name": "Midven Limited",
            "role": "Party to Subscription Agreement (12 June 2012)",
            "appears_in": "Subscription Agreement definition (Article 2.1)"
          },
          {
            "name": "Millpoint Limited",
            "role": "General partner of EALP",
            "appears_in": "Subscription Agreement definition (Article 2.1)"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "23-whisk-sub-agreement-12-june-2012",
        "file": "23-Whisk Sub Agreement - 12 June 2012.md",
        "title": "Subscription Agreement (seed equity / quasi-equity investment into Foodient Limited)",
        "category": "Pre-Seed & Seed Funding",
        "status": "executed",
        "statusNotes": "Executed as a deed by all parties; signatures shown for Foodient, both Managers, BCC (sealed), EALP via Millpoint, Midven, and all four Private Investors.",
        "executionDate": "2012-06-12",
        "effectiveDate": "2012-06-12",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "exclusive jurisdiction of the courts of England",
        "primaryPartyName": "Birmingham City Council (BCC)",
        "primaryPartyId": "birmingham-city-council-bcc",
        "primaryParties": [
          {
            "name": "Foodient Limited",
            "role": "Company / Issuer of shares",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ],
            "contact": {
              "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham B7 4BB"
            }
          },
          {
            "name": "Nick Holzherr",
            "role": "Manager / Director / Founder shareholder",
            "is_user_company": true,
            "entity_type": "person",
            "organization": "Foodient Limited",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "42A New Hampton Lofts, 90 Great Hampton Street, Birmingham B18 6UU"
            }
          },
          {
            "name": "Craig Edmunds",
            "role": "Manager / Director / Founder shareholder",
            "is_user_company": true,
            "entity_type": "person",
            "organization": "Foodient Limited",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "Flat 1 Dock View Road, Barry, South Glamorgan CV63 4LQ"
            }
          },
          {
            "name": "Birmingham City Council (BCC)",
            "role": "Investor (holder of \"A\" Ordinary Shares)",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Investor",
              "Government"
            ],
            "contact": {
              "address": "The Council House, Victoria Square, Birmingham, West Midlands B1 1BB"
            }
          },
          {
            "name": "Early Advantage Limited Partnership (EALP)",
            "role": "Investor (holder of \"A\" Ordinary Shares); acts by its general partner Millpoint Limited",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Investor"
            ],
            "contact": {
              "address": "Second Floor, Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP"
            }
          },
          {
            "name": "Midven Limited",
            "role": "Fund Manager (manages EALP; recipient of arrangement, monitoring and exit fees)",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Investor",
              "Advisor"
            ],
            "contact": {
              "address": "Second Floor, Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP"
            }
          },
          {
            "name": "Peter Michael Dines",
            "role": "Private Investor / Non-executive director",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Investor"
            ],
            "contact": {
              "address": "4 Wentworth Road, Sutton Coldfield B74 2SG"
            }
          },
          {
            "name": "Nate Macleitch",
            "role": "Private Investor / Non-executive director",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Investor"
            ],
            "contact": {
              "address": "101 Dudley Gardens, London, W13 9LU"
            }
          },
          {
            "name": "Douglas Scott",
            "role": "Private Investor / Non-executive director",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Investor"
            ],
            "contact": {
              "address": "9 Friary Avenue, Lichfield, Staffs, WS13 6QQ"
            }
          },
          {
            "name": "Guy Morris",
            "role": "Private Investor (also party to a quasi-equity agreement)",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Investor"
            ],
            "contact": {
              "address": "96 Eton Rise, Eton College Road, London NW2 2DB"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Millpoint Limited",
            "role": "General partner of EALP; signatory by D J M Kerr",
            "appears_in": "Party (4) acting on behalf of EALP"
          },
          {
            "name": "Finance Birmingham Limited (company number 07423867)",
            "role": "BCC's nominated agent for exercising rights under the Agreement",
            "appears_in": "Clause 1.12"
          },
          {
            "name": "D J M Kerr",
            "role": "Director of Millpoint Limited; signatory for EALP; witness for Midven and Guy Morris",
            "appears_in": "Execution block"
          },
          {
            "name": "Toby Harper",
            "role": "Witness to multiple signatures (Foodient, Holzherr, Edmunds, EALP, Dines)",
            "appears_in": "Execution block"
          },
          {
            "name": "Mark Warram",
            "role": "Witness to Nate Macleitch's signature",
            "appears_in": "Execution block"
          },
          {
            "name": "Paul Humphreys",
            "role": "Witness to Douglas Scott's signature",
            "appears_in": "Execution block"
          },
          {
            "name": "Shakespeares Legal LLP",
            "role": "Company solicitors (per Schedule 1)",
            "appears_in": "Schedule 1, Part 1"
          },
          {
            "name": "HSBC Bank Plc",
            "role": "Company bankers (per Schedule 1)",
            "appears_in": "Schedule 1, Part 1"
          }
        ],
        "flags": [],
        "value": null
      }
    ],
    "needs-attention": [
      {
        "id": "02-161121-whisk-bbc-gf",
        "file": "02-161121 Whisk BBC GF.md",
        "title": "Whisk Publisher Agreement (Widget licence)",
        "category": "Intellectual Property Licensing",
        "status": "needs-attention",
        "statusNotes": "Signature blocks name Marc Humby (BBC Worldwide) and Nick Holzherr (Foodient) but the Markdown shows blank signature lines; no execution date evidenced.",
        "executionDate": "2016-12-01",
        "effectiveDate": "2016-12-01",
        "expiryDate": "",
        "governingLaw": "England",
        "governingCourts": "exclusive English courts",
        "primaryPartyName": "BBC Worldwide Limited",
        "primaryPartyId": "bbc-worldwide-limited",
        "primaryParties": [
          {
            "name": "BBC Worldwide Limited",
            "role": "Licensor (content provider, site operator)",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Customer",
              "Partner"
            ],
            "contact": {
              "address": "Television Centre, 101 Wood Lane, London W12 7FA, UK"
            }
          },
          {
            "name": "Foodient Ltd (trading as Whisk)",
            "role": "Platform / Widget operator (Whisk)",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Supplier",
              "Partner"
            ],
            "contact": {
              "address": "Cornwall House, 31 Lionel Street, Birmingham, B3 1AP, UK"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Marc Humby",
            "role": "Director signatory for BBC Worldwide Limited",
            "appears_in": "Signed for BBC Worldwide Limited"
          },
          {
            "name": "Nick Holzherr",
            "role": "Director signatory for Foodient Ltd",
            "appears_in": "Signed for Foodient Ltd (Whisk)"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "03-consultancy-agreement-milica-stojic",
        "file": "03-Consultancy agreement Milica Stojic.md",
        "title": "Consultancy Agreement (executed as a deed)",
        "category": "Service Agreements",
        "status": "needs-attention",
        "statusNotes": "Dated 12 March 2018 and stated to be executed as a deed, but signature lines for both Foodient (Nick Holzherr) and the Consultant are blank in the Markdown copy.",
        "executionDate": "2018-03-12",
        "effectiveDate": "2018-03-12",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "exclusive jurisdiction of the courts of England and Wales",
        "primaryPartyName": "Milica Stojic",
        "primaryPartyId": "milica-stojic",
        "primaryParties": [
          {
            "name": "Foodient Ltd",
            "role": "Client",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Customer"
            ],
            "contact": {
              "address": "Cornwall House, 31 Lionel St, Birmingham, West Midlands B3 1AP (registered office; company number 08001091)"
            }
          },
          {
            "name": "Milica Stojic",
            "role": "Consultant (independent contractor)",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Contractor"
            ],
            "contact": {
              "address": "Jove Maksina 26 a, 26000 Pancevo, Serbia"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Nick Holzherr",
            "role": "Director signing the deed for Foodient Ltd",
            "appears_in": "Execution block (\"Executed as a deed by Foodient Ltd. acting by Nick Holzherr, a director\")"
          },
          {
            "name": "Ruzica Miladinovic",
            "role": "Reporting line for the Consultant (or another person advised during the contract)",
            "appears_in": "Schedule 1 – Services"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "04-option-agreement-template-claire-powell-v2",
        "file": "04-Option Agreement template Claire Powell v2.md",
        "title": "EMI Option Agreement (deed)",
        "category": "Share Options",
        "status": "needs-attention",
        "statusNotes": "Executed as a deed, but signature/witness fields and dated header (\"DATED 2012\") are blank in the Markdown copy; execution state cannot be confirmed from source.",
        "executionDate": "",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "exclusive courts of England and Wales",
        "primaryPartyName": "Claire Louise Powell",
        "primaryPartyId": "claire-louise-powell",
        "primaryParties": [
          {
            "name": "Foodient Ltd",
            "role": "Company / Option Grantor",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ],
            "contact": {
              "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham, West Midlands B7 4BB"
            }
          },
          {
            "name": "Claire Louise Powell",
            "role": "Option Holder (employee)",
            "is_user_company": false,
            "entity_type": "person",
            "organization": "Foodient Ltd",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "Farthings, Sheeplands Lane, Sherbourne, Dorset, DT9 4BW"
            }
          }
        ],
        "otherNamedParties": [],
        "flags": [],
        "value": null
      },
      {
        "id": "06-mutual-nda-foodient-greatbritishchefs",
        "file": "06-Mutual_NDA_Foodient_GreatBritishChefs.md",
        "title": "Mutual Non-Disclosure Agreement",
        "category": "Confidentiality & Non-Disclosure Agreements",
        "status": "needs-attention",
        "statusNotes": "Dated 09.07.2012 with Nicolas Holzherr (Co-Founder) named for Foodient, but signature lines are blank in the Markdown copy and no Great British Chefs signatory name/title is recorded.",
        "executionDate": "2012-07-09",
        "effectiveDate": "",
        "expiryDate": "2017-07-09",
        "governingLaw": "England",
        "governingCourts": "non-exclusive jurisdiction of the courts of England",
        "primaryPartyName": "Great British Chefs Ltd",
        "primaryPartyId": "great-british-chefs-ltd",
        "primaryParties": [
          {
            "name": "Foodient Ltd",
            "role": "Mutual Disclosing/Receiving Party",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "Faraday Wharf, Birmingham, B7 4BB (registered office); Company No. 08001091"
            }
          },
          {
            "name": "Great British Chefs Ltd",
            "role": "Mutual Disclosing/Receiving Party",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "72 Queen's Head Street, London, N1 8NG (registered office); Company No. 07470770"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Nicolas Holzherr",
            "role": "Co-Founder, Foodient Ltd (named signatory)",
            "appears_in": "Signature block for Foodient (signature line blank)"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "07-mutual-nda-reciply-foodity",
        "file": "07-Mutual_NDA_Reciply_Foodity.md",
        "title": "Mutual Non-Disclosure Agreement",
        "category": "Confidentiality & Non-Disclosure Agreements",
        "status": "needs-attention",
        "statusNotes": "Signature blocks list signatories (Nicolas Holzherr, Co-Founder for Recip.ly; Johnathan Agnes, Commercial Lead for Foodity) but the signature lines themselves appear blank in the Markdown copy.",
        "executionDate": "2012-03-02",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "England",
        "governingCourts": "non-exclusive jurisdiction of the courts of England",
        "primaryPartyName": "Recip.ly Ltd.",
        "primaryPartyId": "recip-ly-ltd",
        "primaryParties": [
          {
            "name": "Recip.ly Ltd.",
            "role": "Disclosing Party and Receiving Party (mutual)",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "Flat 1, 57 Dock View Road, Barry, Cardiff CF63 4LQ (Company No. 07341990)"
            }
          },
          {
            "name": "Foodity Ltd.",
            "role": "Disclosing Party and Receiving Party (mutual)",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "Suffolk House, George Street, Croydon, Surrey, CR0 0YN (Company No. 07139884)"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Nicolas Holzherr",
            "role": "Co-Founder, signatory for Recip.ly Ltd.",
            "appears_in": "Signature block"
          },
          {
            "name": "Johnathan Agnes",
            "role": "Commercial Lead, signatory for Foodity Ltd.",
            "appears_in": "Signature block"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "08-120712-claire-powell-employment-contract",
        "file": "08-120712 Claire Powell Employment Contract.md",
        "title": "Employment Contract (Section 1 ERA 1996 statement)",
        "category": "Employment Contracts",
        "status": "needs-attention",
        "statusNotes": "Signature blocks present for Nick Holzherr (for Foodient Limited) and Claire Louise Powell, but the Markdown shows blank signature lines and no signed date.",
        "executionDate": "2012-07-12",
        "effectiveDate": "2012-06-25",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "",
        "primaryPartyName": "Claire Louise Powell",
        "primaryPartyId": "claire-louise-powell",
        "primaryParties": [
          {
            "name": "Foodient Limited",
            "role": "Employer",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Employee"
            ]
          },
          {
            "name": "Claire Louise Powell",
            "role": "Employee (Marketing Assistant)",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "Farthings, Sheeplands Lane, Sherbourne, Dorset, DT9 4BW"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Nick Holzherr",
            "role": "Signatory for Foodient Limited",
            "appears_in": "Signed for and on behalf of Foodient Limited"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "09-collaboration-agreement-whisk-mkc-final",
        "file": "09-Collaboration Agreement Whisk & MKC FINAL.md",
        "title": "Strategic Services and Collaboration Agreement",
        "category": "Joint Venture Agreements",
        "status": "needs-attention",
        "statusNotes": "Marked \"FINAL\" but signature blocks (Name/Title) for both parties are blank and execution date placeholder (\"_________, 2014\") is unfilled.",
        "executionDate": "",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "State of New York",
        "governingCourts": "ICC arbitration seated in London (three arbitrators); Supreme Court of the State of New York (NY County) and US District Court for SDNY for non-arbitral proceedings; injunctive relief available in any court of competent jurisdiction",
        "primaryPartyName": "McCormick & Company, Incorporated",
        "primaryPartyId": "mccormick-company-incorporated",
        "primaryParties": [
          {
            "name": "McCormick & Company, Incorporated",
            "role": "Strategic Collaboration Partner / FlavorPrint Services owner / Convertible Note investor",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Partner",
              "Investor",
              "Customer"
            ],
            "contact": {
              "address": "18 Loveton Circle, Sparks, Maryland 21152, USA"
            }
          },
          {
            "name": "Foodient Limited (trading as Whisk)",
            "role": "Service provider (Analysis/Consulting/Promotion services) / Collaboration counterparty / Note issuer",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "Birmingham Science Park, Aston Faraday Wharf, Holt Street, Birmingham, West Midlands B7 4BB, UK"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Stuart Renshaw",
            "role": "McCormick's initial appointed Representative under the joint decision-making framework",
            "appears_in": "Section 4(a) Appointment of Representatives"
          },
          {
            "name": "Nick Holzherr",
            "role": "Whisk's initial appointed Representative under the joint decision-making framework",
            "appears_in": "Section 4(a) Appointment of Representatives"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "11-employment-contract-oliver-mason",
        "file": "11-Employment Contract Oliver Mason.md",
        "title": "Employment Contract",
        "category": "Employment Contracts",
        "status": "needs-attention",
        "statusNotes": "Signature blocks present with typed names (Nick Holzherr for Foodient; Oliver Mason) but no actual signatures, dates, or witness details visible in the Markdown",
        "executionDate": "2013-12-01",
        "effectiveDate": "2013-12-01",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "exclusive courts of England and Wales",
        "primaryPartyName": "Oliver Mason",
        "primaryPartyId": "oliver-mason",
        "primaryParties": [
          {
            "name": "Foodient Limited",
            "role": "Employer",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham, B7 4BB (registered office; company number 08001091)"
            }
          },
          {
            "name": "Oliver Mason",
            "role": "Employee (Senior Developer)",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "57 Northfield Rd, Kings Norton, B30 1JD"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Nick Holzherr",
            "role": "CEO; signatory for Foodient Ltd",
            "appears_in": "Signature block as signing for and on behalf of Foodient Ltd"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "13-matthew-hines-employment-contract",
        "file": "13-Matthew Hines Employment Contract.md",
        "title": "Contract of Employment (section 1 ERA 1996 statement of terms)",
        "category": "Employment Contracts",
        "status": "needs-attention",
        "statusNotes": "Signature lines for Craig Edmunds (for Foodient) and Matthew Hines, plus the date line, are blank in the Markdown copy; execution cannot be confirmed from source.",
        "executionDate": "2012-11-12",
        "effectiveDate": "2012-11-12",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "",
        "primaryPartyName": "Matthew Hines",
        "primaryPartyId": "matthew-hines",
        "primaryParties": [
          {
            "name": "Foodient Limited",
            "role": "Employer",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ]
          },
          {
            "name": "Matthew Hines",
            "role": "Employee (Junior Developer)",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "9 Ash Grove, 139 Worcester Road, Malvern, WR14 1ET"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Craig Edmunds",
            "role": "Signatory for and on behalf of Foodient Limited; co-reporting line",
            "appears_in": "Signature block; reports-to in clause 2.1"
          },
          {
            "name": "Nick Holzherr",
            "role": "Co-reporting line for the employee",
            "appears_in": "Clause 2.1 (reports to)"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "14-mutual-nda-foodient-drjennykabir",
        "file": "14-Mutual_NDA_Foodient_DrJennyKabir.md",
        "title": "Mutual Confidentiality and Non-Disclosure Agreement",
        "category": "Confidentiality & Non-Disclosure Agreements",
        "status": "needs-attention",
        "statusNotes": "Date field blank at top; Foodient signature block names Nicolas Holzherr (Co-Founder) but no signature image is captured; Dr Jenny Kabir's signature/name/title lines are blank in the Markdown.",
        "executionDate": "",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "England",
        "governingCourts": "non-exclusive jurisdiction of the courts of England",
        "primaryPartyName": "Dr Jenny Kabir",
        "primaryPartyId": "dr-jenny-kabir",
        "primaryParties": [
          {
            "name": "Foodient Ltd.",
            "role": "Disclosing Party and Receiving Party (Mutual)",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Partner"
            ],
            "contact": {
              "address": "Faraday Wharf, Birmingham, B7 4BB (registered office); Company No. 08001091"
            }
          },
          {
            "name": "Dr Jenny Kabir",
            "role": "Disclosing Party and Receiving Party (Mutual)",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Advisor",
              "Partner"
            ]
          }
        ],
        "otherNamedParties": [
          {
            "name": "Nicolas Holzherr",
            "role": "Co-Founder, Foodient Ltd.",
            "appears_in": "Named on Foodient signature block"
          }
        ],
        "flags": [],
        "value": null
      },
      {
        "id": "15-option-agreement-anthony-herron",
        "file": "15-Option Agreement Anthony Herron.md",
        "title": "EMI Share Option Agreement (executed as a deed)",
        "category": "Share Options",
        "status": "needs-attention",
        "statusNotes": "Document is styled as a deed and contains execution blocks for Foodient Ltd and Anthony Herron, but the Markdown shows blank signature, witness, and date fields; Date of Grant and \"DATED\" are not populated.",
        "executionDate": "",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "exclusive courts of England and Wales",
        "primaryPartyName": "Anthony Herron",
        "primaryPartyId": "anthony-herron",
        "primaryParties": [
          {
            "name": "Foodient Ltd",
            "role": "Company / Grantor of EMI option",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, West Midlands B7 4BB (company number 08001091)"
            }
          },
          {
            "name": "Anthony Herron",
            "role": "Option Holder (employee)",
            "is_user_company": false,
            "entity_type": "person",
            "tags": [
              "Employee"
            ],
            "contact": {
              "address": "100 Highfield Road, Hall Green, Birmingham"
            }
          }
        ],
        "otherNamedParties": [],
        "flags": [],
        "value": null
      },
      {
        "id": "21-ealp-quasi-equity-jan-2013-1",
        "file": "21-EALP Quasi-Equity Jan 2013 1.md",
        "title": "Quasi-Equity Agreement (deed)",
        "category": "Debt Finance",
        "status": "needs-attention",
        "statusNotes": "Executed as a deed; EALP/Millpoint side signed (D J M Kerr, witness Bay Murror), but Foodient director signature line and execution date are blank.",
        "executionDate": "",
        "effectiveDate": "",
        "expiryDate": "",
        "governingLaw": "England and Wales",
        "governingCourts": "exclusive English courts",
        "primaryPartyName": "Early Advantage Limited Partnership (acting by general partner Millpoint Limited)",
        "primaryPartyId": "early-advantage-limited-partnership-acting-by-general-partner-millpoint-limited",
        "primaryParties": [
          {
            "name": "Foodient Limited",
            "role": "Borrower / Company receiving quasi-equity advance",
            "is_user_company": true,
            "entity_type": "organization",
            "tags": [
              "Other"
            ],
            "contact": {
              "address": "Birmingham Science Park Aston, Faraday Wharf, Holt Street, Birmingham B7 4BB (registered office; company no. 08001091)"
            }
          },
          {
            "name": "Early Advantage Limited Partnership (acting by general partner Millpoint Limited)",
            "role": "Lender / Quasi-equity provider",
            "is_user_company": false,
            "entity_type": "organization",
            "tags": [
              "Investor"
            ],
            "contact": {
              "address": "Cavendish House, 39-41 Waterloo Street, Birmingham B2 5PP (LP no. LP013679)"
            }
          }
        ],
        "otherNamedParties": [
          {
            "name": "Millpoint Limited",
            "role": "General partner of EALP, acting on its behalf",
            "appears_in": "Parties block and execution block"
          },
          {
            "name": "D J M Kerr",
            "role": "Director of Millpoint Limited",
            "appears_in": "Signed the deed for EALP/Millpoint"
          },
          {
            "name": "Bay Murror",
            "role": "Witness",
            "appears_in": "Witness to D J M Kerr's signature; address recorded as The Pantiles, Bobon Road, Wexford on Avon, Stafford upon Avon, Warwickshire CV37 8EY (handwritten, possibly garbled)"
          },
          {
            "name": "Fund Manager",
            "role": "Acts on behalf of EALP for exercising rights and receiving payments (entity not named in this document; defined by reference to Subscription Agreement)",
            "appears_in": "Clauses 2.4-2.5, 3.1.1, 3.2, 5.3"
          },
          {
            "name": "BCC / Managers / Private Investors",
            "role": "Other parties to the Subscription Agreement referenced in Recital (B)",
            "appears_in": "Recital B (definitions imported from Subscription Agreement)"
          }
        ],
        "flags": [],
        "value": null
      }
    ]
  }
};
