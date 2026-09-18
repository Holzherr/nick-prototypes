// The Terms and Privacy Policy exactly as written (from the Word documents of 18 Sep 2026), English only.
// Edit the wording here, not in the component; bump `updated` with it.

export interface LegalDocument {
  slug: 'terms' | 'privacy';
  title: string;
  updated: string;
  intro: string[];
  sections: { heading: string; paragraphs: string[] }[];
}

export const TERMS: LegalDocument = {
  "slug": "terms",
  "title": "Terms and Conditions",
  "updated": "18 September 2026",
  "intro": [],
  "sections": [
    {
      "heading": "1. Who we are",
      "paragraphs": [
        "These Terms and Conditions (the “Terms”) govern the use of the children’s educational maths quiz game and related website or app service (the “Service” or “Game”) available at www.nickholzherr.com/maths.",
        "The Service is published by Nick Holzherr, an individual sole trader based in the United Kingdom. Nick Holzherr is the provider of the Service and controller of personal data processed through it."
      ]
    },
    {
      "heading": "2. About the Service",
      "paragraphs": [
        "The Game provides progressive-difficulty maths quizzes and related learning activities for children. It is designed to support practice and exploration of maths skills.",
        "The Game can be played as a Guest without creating an account. A parent or legal guardian (a “Parent”) may create and control a Parent account. Account features require Parent sign-in."
      ]
    },
    {
      "heading": "3. Eligibility and parental responsibility",
      "paragraphs": [
        "To create a Parent account, you must be a Parent with authority to accept these Terms for yourself and for any child you permit to use that account. Children must not create a Parent account in their own name.",
        "Where a Parent account is used, the Parent is responsible for the child’s use of the Service through that account, for supervising that use, and for ensuring that account information is accurate and kept secure.",
        "Guest play is available without an account. We encourage Parents to supervise young children’s use of the Service, including when they play as Guests. We do not knowingly create accounts for children in their own name."
      ]
    },
    {
      "heading": "4. Accounts and acceptable use",
      "paragraphs": [
        "Parents must keep account login details confidential, promptly tell us about suspected unauthorised access, and remain responsible for activity carried out through their account.",
        "You and any child using the Service must use it lawfully and must not interfere with its operation; gain unauthorised access; introduce malicious code; collect personal data from other users; use the Service for advertising or other commercial purposes; or copy, redistribute, reverse engineer, or exploit the Game except as permitted by law.",
        "We may suspend or restrict an account where reasonably necessary to protect the Service, users, or third parties, or where these Terms are breached."
      ]
    },
    {
      "heading": "5. Children’s use, parental controls and learning data",
      "paragraphs": [
        "A child profile may include a first name, favourite emoji, and learning-progress information, such as time spent on challenges and identified strengths or weaknesses. We use this information to operate the Service and suggest appropriate next activities.",
        "The Parent may access the child’s learning data through the Parent account and is responsible for deciding who may access that account.",
        "We may use aggregate or anonymised information to understand and improve the Service. The Service contains no advertising, we do not sell personal data, and we do not share personal data with third parties for their own marketing purposes."
      ]
    },
    {
      "heading": "6. Licence and intellectual property",
      "paragraphs": [
        "Subject to these Terms, Nick Holzherr grants users of the Service a limited, personal, non-exclusive, non-transferable, revocable licence to access and use the Service for non-commercial educational purposes.",
        "All intellectual-property rights in the Service, including its quizzes, software, design, content, and branding, are owned by or licensed to Nick Holzherr. Except for the licence above and rights that cannot lawfully be restricted, no rights are granted to you."
      ]
    },
    {
      "heading": "7. Limited profile content",
      "paragraphs": [
        "The limited information a Parent or child enters into a profile, such as a first name or favourite emoji, remains the responsibility of the Parent. You grant us a non-exclusive, worldwide, royalty-free licence to use that information only as needed to provide, secure, support, and improve the Service in accordance with these Terms and the Privacy Policy.",
        "If you submit feedback through the Service, it may include a message and optional contact details. You grant us a non-exclusive, worldwide, royalty-free licence to use that feedback to improve the Service. We have no obligation to respond. You must not submit feedback that is unlawful, infringing, or inappropriate.",
        "Please do not enter unnecessary sensitive personal information or content that is unlawful, infringing, or inappropriate for a children’s service."
      ]
    },
    {
      "heading": "8. Privacy",
      "paragraphs": [
        "Our Privacy Policy explains how we collect, use, retain, protect, and share personal data in connection with the Service, including children’s information. Please read it before allowing a child to use the Game."
      ]
    },
    {
      "heading": "9. Availability and changes to the Service",
      "paragraphs": [
        "The Service is currently provided free of charge and without advertising. We may maintain, update, modify, suspend, or discontinue features where reasonably necessary, including for security, legal, technical, or service-improvement reasons.",
        "If a change materially and adversely affects your use of the Service, we will give reasonable notice where practicable and explain any available options, including ending your use of the Service."
      ]
    },
    {
      "heading": "10. Fees and paid features",
      "paragraphs": [
        "There are currently no charges for using the Service. If we introduce optional paid features in future, we will clearly present the price, relevant payment terms, and any additional terms before you choose to purchase them."
      ]
    },
    {
      "heading": "11. Digital content, cancellation and statutory rights",
      "paragraphs": [
        "If paid digital content or services are offered in future, any applicable pre-contract information and cancellation rights will be provided before purchase. Where the law requires your express consent to immediate supply and acknowledgement that cancellation rights may be affected, we will obtain that consent before supply begins.",
        "Nothing in these Terms affects rights that consumers have by law, including rights under the Consumer Rights Act 2015 in relation to digital content and digital services."
      ]
    },
    {
      "heading": "12. Educational disclaimer",
      "paragraphs": [
        "The Game is an educational support tool only. It is not a substitute for formal education, teaching, assessment, or professional educational advice. We do not guarantee any particular learning outcome, grade, skill level, or progress."
      ]
    },
    {
      "heading": "13. Liability",
      "paragraphs": [
        "Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any liability that cannot lawfully be excluded or limited.",
        "If you are a consumer, we are responsible for loss or damage you suffer that is a foreseeable result of our breach of these Terms or failure to use reasonable care and skill. We are not responsible for business losses suffered by consumers.",
        "To the extent permitted by law, for users who are not consumers, we will not be liable for indirect or consequential loss, loss of profit, revenue, business, goodwill, data, or anticipated savings, and our total liability is limited to reasonably foreseeable direct loss caused by our breach of these Terms."
      ]
    },
    {
      "heading": "14. Suspension and termination",
      "paragraphs": [
        "You may stop using the Service at any time. To request closure and deletion of a Parent account, please email us at nick@nickholzherr.com. We will close and delete the Parent account on request and handle any personal data in accordance with the Privacy Policy and applicable law. We may suspend or terminate access where reasonably necessary for the reasons described in these Terms, including a material breach, protection of children or other users, security, legal compliance, or discontinuance of the Service.",
        "On termination, the licence to use the Service ends. We will handle personal data in accordance with the Privacy Policy and applicable law."
      ]
    },
    {
      "heading": "15. Changes to these Terms",
      "paragraphs": [
        "We may change these Terms to reflect changes in law, security, technology, or the Service. For material changes, we will give at least 30 days’ notice by a prominent notice in the Service or by email where we have your email address.",
        "If you do not agree with a material change, you may stop using the Service and request closure of your account as described in Section 14 before the change takes effect. Continued use after the effective date means you accept the updated Terms to the extent permitted by law."
      ]
    },
    {
      "heading": "16. General",
      "paragraphs": [
        "If a provision is unenforceable, it will be adjusted only as far as necessary and the remainder will continue in effect. A delay in enforcing a right is not a waiver of that right.",
        "We are not responsible for a failure or delay caused by circumstances beyond our reasonable control, but this does not affect your statutory rights. We may transfer our rights or obligations only where this does not reduce your consumer rights. You may not transfer your rights without our written consent.",
        "These Terms and the Privacy Policy are the entire agreement between you and us concerning the Service. No person other than you and us has a right to enforce these Terms under the Contracts (Rights of Third Parties) Act 1999."
      ]
    },
    {
      "heading": "17. Governing law and jurisdiction",
      "paragraphs": [
        "These Terms are governed by the laws of England and Wales. The courts of England and Wales will have jurisdiction, but consumers who live outside England and Wales keep the benefit of any mandatory protections of the law of their country of residence and may bring proceedings where applicable law permits."
      ]
    },
    {
      "heading": "18. Complaints",
      "paragraphs": [
        "If you have a complaint about the Service, please contact Nick Holzherr using the contact details below. We will investigate and respond as soon as reasonably practicable."
      ]
    },
    {
      "heading": "19. Contact",
      "paragraphs": [
        "Nick Holzherr",
        "Email: nick@nickholzherr.com",
        "Postal address for notices: 63 Wellington Road, Birmingham, B15 2ET, UK"
      ]
    }
  ]
};

export const PRIVACY: LegalDocument = {
  "slug": "privacy",
  "title": "Privacy Policy",
  "updated": "18 September 2026",
  "intro": [
    "Nick Holzherr, an individual based in the United Kingdom, is the controller of the personal data described in this Privacy Policy. In this policy, “we”, “us” and “our” mean Nick Holzherr.",
    "This policy explains how we use personal data in our educational maths quiz game for children. Anyone can play as a Guest without an account. A parent or other person with parental responsibility may create and control an account, and a child may use the game through that account.",
    "Contact us about this policy or a privacy request at nick@nickholzherr.com or 63 Wellington Road, Birmingham, B15 2ET, UK."
  ],
  "sections": [
    {
      "heading": "At a glance",
      "paragraphs": [
        "We design the game with children’s best interests as a primary consideration. We collect only the information we need to run the game, help a child learn maths and, where a parent account is used, let the parent see learning progress.",
        "We do not show advertising, sell personal data, or share personal data with third parties for their marketing or unrelated commercial purposes. We do not use children’s data for commercial exploitation or profile children for that purpose."
      ]
    },
    {
      "heading": "Information we collect",
      "paragraphs": [
        "Parent account information. We collect the email address or other sign-in identifier a parent provides, and the account sign-in credentials needed to create, secure and operate the parent account. We do not ask for phone numbers or payment-card details as part of the standard free game.",
        "Child learning information. Under the parent account, a child profile may include the child’s first name, favourite emoji, optional birthday, and progress and performance information. This can include the time taken to complete challenges, areas of strength and weakness, and suggested next maths activities.",
        "Technical and security information. We collect limited technical information that is necessary to deliver and protect the game, such as IP address, device and browser information, security or error logs, and the visit-counting information described below.",
        "Feedback information. We collect a feedback message and, if the person chooses to provide it, an optional contact address. Feedback may relate to a parent or any other user, including a Guest player.",
        "Visit counting. To count visits, we use a random identifier for each browser tab. This identifier is not a cookie and is not used for advertising."
      ]
    },
    {
      "heading": "How and why we use information",
      "paragraphs": [
        "We use parent account information and child learning information to provide the game, personalise the learning path, suggest appropriate next maths activities, and let the parent view the child’s progress. In Guest mode, we use limited technical and visit-counting information to operate, secure and understand use of the game. Our usual legal basis is that this is necessary to provide the service requested through an account or, for Guest mode, our legitimate interests in operating the game while taking particular care to protect children’s privacy and rights.",
        "We use limited technical and security information to operate, secure and troubleshoot the service. We use feedback messages and any optional contact address to respond where contact details are provided and to improve the service. We rely on our legitimate interests in keeping the service safe, reliable and useful, while taking particular care to protect children’s privacy and rights.",
        "We may use aggregated or anonymised information to understand how the game works and improve it. Where possible, we remove or aggregate identifying information before doing this. We rely on carefully balanced legitimate interests for this limited improvement work.",
        "Where UK data protection law requires consent for a child’s data or a particular use of technology, we seek it from the parent or person with parental responsibility. A parent may withdraw consent, but this may affect features that depend on it."
      ]
    },
    {
      "heading": "No advertising, sales or marketing sharing",
      "paragraphs": [
        "We do not use personal data for targeted advertising. We do not sell personal data. We do not give personal data to any third party for its own marketing or unrelated commercial purposes."
      ]
    },
    {
      "heading": "Who can access information",
      "paragraphs": [
        "The parent can access the child’s learning information through the parent account. Nick Holzherr can access information only where needed to operate, support, secure or improve the service. If we use service providers, they can access information only to provide their services to us and under contractual confidentiality and data-protection obligations."
      ]
    },
    {
      "heading": "Service providers and international processing",
      "paragraphs": [
        "We use necessary service providers to run and secure the game. Current named service providers: Supabase (database and hosting), Cloudflare (security and content delivery).",
        "Nick Holzherr operates the Service from the United Kingdom. Personal data may be processed in the following locations, as applicable: United Kingdom (operator), Ireland (Supabase eu-west-1), and Cloudflare's global edge network, as applicable.",
        "Transfers from the United Kingdom to Ireland, which is in the EEA, are covered by UK adequacy regulations. If personal data is transferred to another location, we use safeguards required by applicable law, such as an adequacy decision or the UK International Data Transfer Agreement or Addendum, as appropriate. You can contact us for further information about the safeguards that apply."
      ]
    },
    {
      "heading": "Cookies and similar technology",
      "paragraphs": [
        "We use only the cookies or similar technologies needed to run, secure and remember choices in the game unless we ask for consent for another use. The random identifier used for visit counting is not a cookie. We do not use advertising cookies or use the visit-counting identifier for advertising."
      ]
    },
    {
      "heading": "How long we keep information",
      "paragraphs": [
        "We keep parent account information and child learning information for the life of the account. To request deletion, email us using the contact details below. After a verified deletion request, we will delete or anonymise that information without undue delay and normally within one month following a verified deletion request. There is no in-app self-service deletion control. We may keep information longer where needed to meet a legal obligation, resolve a dispute or protect the service.",
        "For Guest players, we keep limited technical and security information and visit-counting identifiers only briefly, for as long as reasonably necessary to operate, secure and count visits to the game. We keep feedback messages and any optional contact address only for as long as reasonably necessary to respond, where contact details are provided, and improve the service.",
        "We may keep genuinely anonymised, aggregated information for longer because it can no longer identify a parent or child."
      ]
    },
    {
      "heading": "Children’s privacy",
      "paragraphs": [
        "This game is for children, including young children. We use clear, age-appropriate design and aim to collect the minimum personal data needed for the learning experience.",
        "We do not use children’s data for commercial profiling or exploitation. Personalisation is limited to helping the child with maths, such as identifying strengths, weaknesses and suitable next activities.",
        "Parents have controls through their account and can view the child’s learning data. They can contact us to ask about, correct, delete or otherwise exercise rights in relation to their child’s data."
      ]
    },
    {
      "heading": "Security",
      "paragraphs": [
        "We use appropriate technical and organisational measures to protect personal data. These include access controls, encryption or secure transmission where appropriate, and measures to prevent, detect and respond to security issues. No internet service can be completely secure, but we keep our safeguards under review."
      ]
    },
    {
      "heading": "Your rights and how to complain",
      "paragraphs": [
        "Under the UK GDPR and the Data Protection Act 2018, you may have rights to access, correct, erase, restrict, receive a portable copy of, or object to the use of your personal data. You may also withdraw consent where we rely on consent. A parent or person with parental responsibility may exercise these rights for their child’s learning data by contacting us using the details above.",
        "Please contact us first if you have a privacy concern or complaint, so that we can investigate and respond. We will acknowledge your complaint within 30 days and notify you of its outcome. You also have the right to complain to the Information Commissioner’s Office (ICO), the UK data protection regulator, at www.ico.org.uk/make-a-complaint. If you use the game outside the United Kingdom, local law may give you additional rights."
      ]
    },
    {
      "heading": "Changes to this policy",
      "paragraphs": [
        "We may update this policy when the game or the way we use information changes. We will post the updated version and change the “Last updated” date. If a change is important, we will take additional steps to tell parents where appropriate."
      ]
    },
    {
      "heading": "Contact",
      "paragraphs": [
        "For questions, requests or complaints about privacy, contact Nick Holzherr at nick@nickholzherr.com or 63 Wellington Road, Birmingham, B15 2ET, UK."
      ]
    }
  ]
};

/** What sign-up records as accepted, so a later wording change can tell who agreed to which version. */
export const TERMS_VERSION = '2026-09-18';
