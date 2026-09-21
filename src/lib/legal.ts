/**
 * The published policies, as data.
 *
 * Kept here rather than as three pages of markup so the wording is editable in
 * one place and every document is laid out by the same renderer — three hand-
 * built pages drift in their heading levels and spacing the first time one of
 * them is amended.
 *
 * THE SECTION NUMBERS ARE THE SOURCE DOCUMENTS'. They run 2, 3, 4 … because
 * each policy opens with an unnumbered preamble, and they are left exactly as
 * the signed copies have them: a policy that is cited by clause number is not
 * ours to renumber for tidiness.
 *
 * The drafts carry a "CONFIDENTIAL" line in their footer. That is a
 * document-template artefact and is deliberately not published — a privacy
 * policy stamped confidential on a public page reads as a mistake, which is the
 * kindest reading of it.
 */

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'sub'; text: string }
  | { type: 'list'; items: string[] }

export type LegalSection = { heading: string; blocks: LegalBlock[] }

export type LegalDoc = {
  /** Page title, and the h1. */
  title: string
  /** One line under the title for search results and the page meta. */
  summary: string
  updated?: string
  intro: LegalBlock[]
  sections: LegalSection[]
}

const p = (text: string): LegalBlock => ({ type: 'p', text })
const sub = (text: string): LegalBlock => ({ type: 'sub', text })
const list = (...items: string[]): LegalBlock => ({ type: 'list', items })

export const privacy: LegalDoc = {
  title: 'Privacy Policy',
  summary:
    'How skeo collects, uses, stores and protects your personal information, under the Digital Personal Data Protection Act, 2023.',
  updated: '14 September 2026',
  intro: [
    p('Menler Learning Systems Private Limited (“skeo,” “we,” “us,” “our”) respects your privacy and is committed to protecting your personal information. This Policy explains how we collect, use, store, and protect information when you access our website, programs, learning platforms, communities, certifications, and related services.'),
    p('This Policy is governed in accordance with the Digital Personal Data Protection Act, 2023 and applicable rules thereunder.'),
    p('By using skeo’s services, you agree to this Privacy Policy.'),
  ],
  sections: [
    {
      heading: '1. Information we collect',
      blocks: [
        sub('Personal information'),
        list(
          'Name',
          'Email address',
          'Mobile number',
          'Date of birth',
          'Educational & employment information',
          'LinkedIn profile',
          'Resume / CV',
          'City, state, and country',
        ),
        sub('Learning information'),
        list(
          'Program enrollments',
          'Attendance records',
          'Assessment results',
          'Assignment submissions',
          'Certification status',
          'Learning progress',
        ),
        sub('Technical information'),
        list(
          'IP address',
          'Browser and device information',
          'Website usage data',
          'Cookies and analytics information',
        ),
        sub('Payment information'),
        p('Payments are processed through authorised third-party payment providers. skeo does not store complete card details, banking credentials, or payment passwords.'),
      ],
    },
    {
      heading: '2. How we use your information',
      blocks: [
        list(
          'Deliver educational programs and services',
          'Create and manage learner accounts',
          'Process payments and enrollments',
          'Provide mentorship and learner support',
          'Conduct assessments and issue certifications',
          'Facilitate interview preparation and career support',
          'Improve our platform, content, and services',
          'Communicate important updates and announcements',
          'Comply with legal and regulatory obligations',
        ),
      ],
    },
    {
      heading: '3. Sharing of information',
      blocks: [
        p('We do not sell personal information. We may share information with:'),
        list(
          'Learning management and technology service providers',
          'Payment processors',
          'Mentors, instructors, and evaluators',
          'Hiring partners and employers (with learner consent)',
          'Government authorities or legal bodies where required by law',
        ),
        p('skeo does not guarantee employment, interviews, internships, or placement outcomes.'),
      ],
    },
    {
      heading: '4. Cross-border data transfers',
      blocks: [
        p('Your personal data may be processed or stored outside India by our technology partners, including cloud infrastructure and SaaS service providers. skeo ensures that appropriate safeguards are in place for any such international data transfers, in accordance with applicable law.'),
      ],
    },
    {
      heading: '5. Cookies',
      blocks: [
        p('We use cookies and similar technologies to improve platform functionality, understand user behaviour, and enhance user experience. You may disable cookies through your browser settings; however, certain features may not function properly.'),
      ],
    },
    {
      heading: '6. Data retention & security',
      blocks: [
        p('We retain personal data for a period of five (5) years from the date of last activity, or as required by applicable law, whichever is longer. skeo implements industry-standard technical and organisational safeguards to protect personal information. No system is completely immune to security breaches. In the event of a breach affecting your data, skeo will notify you as required by applicable law.'),
      ],
    },
    {
      heading: '7. Your rights',
      blocks: [
        list(
          'Access your personal information',
          'Correct inaccurate information',
          'Update your profile',
          'Delete your account (subject to legal and operational requirements)',
          'Opt out of marketing communications',
        ),
        p('You may also withdraw consent at any time by writing to support@skeoai.com. Withdrawal of consent may affect your ability to access certain services.'),
      ],
    },
    {
      heading: '8. Grievance officer',
      blocks: [
        p('In accordance with applicable Indian data protection laws, skeo has designated a Grievance Officer to address concerns regarding the processing of personal data. Grievances may be submitted to:'),
        list(
          'Grievance Officer — Menler Learning Systems Private Limited',
          'Email: support@skeoai.com',
          'Response timeline: within 30 days of receipt of grievance',
        ),
      ],
    },
    {
      heading: '9. Children’s privacy',
      blocks: [
        p('Our services are intended for individuals aged 16 years and above. Users below 18 years must obtain verifiable parental or guardian consent prior to enrolment. skeo reserves the right to terminate access if this requirement is not met.'),
      ],
    },
    {
      heading: '10. Third-party services',
      blocks: [
        p('Our website and platform may contain links to third-party websites or services. skeo is not responsible for their privacy practices, content, or policies.'),
      ],
    },
    {
      heading: '11. Changes to this Policy',
      blocks: [
        p('skeo reserves the right to update this Policy. Continued use of services after the updated Policy is published constitutes acceptance of the revised terms. Updated versions will be published on our website with a revised effective date.'),
      ],
    },
    {
      heading: '12. Contact us',
      blocks: [
        list(
          'Menler Learning Systems Private Limited',
          'Website: skeoai.com',
          'Email: support@skeoai.com',
        ),
        sub('Consent'),
        p('By accessing, registering for, purchasing, or using any skeo service, you consent to the collection, use, storage, and processing of your information as described in this Privacy Policy.'),
      ],
    },
  ],
}

export const refund: LegalDoc = {
  title: 'Refund Policy',
  summary:
    'When fees paid to skeo are refundable, what is strictly non-refundable, and how an approved refund is processed.',
  intro: [
    p('skeo is committed to delivering a high-quality learning experience through its AI Tools Course, Playbooks, Pre-Recorded programs, and Self-Paced Courses.'),
    p('By enrolling in any skeo program, you acknowledge and agree to this Refund Policy.'),
  ],
  sections: [
    {
      heading: '1. Programs covered',
      blocks: [
        list('AI Tools Course', 'Playbooks', 'Pre-Recorded', 'Self-Paced Course'),
      ],
    },
    {
      heading: '2. AI Tools Course, Playbooks, Pre-Recorded & Self-Paced Courses',
      blocks: [
        p('These are digital products delivered with instant or near-instant access on purchase. Fees paid are non-refundable once access to the course, playbook, or learning materials has been granted. No partial refunds shall be issued for mid-program withdrawal or discontinuation.'),
        p('A refund may be considered only if:'),
        list('skeo has failed to provide access to the purchased course, playbook, or pre-recorded content due to a verified technical failure on our end.'),
        p('For the purposes of this Policy, access is deemed granted upon issuance of login credentials, an onboarding email, or the sharing of learning materials — whichever occurs first.'),
        p('No refund shall be granted on grounds including:'),
        list(
          'Change of mind',
          'Lack of time or availability',
          'Personal, academic, or professional commitments',
          'Dissatisfaction with content, teaching style, or learning outcomes',
          'Non-completion of assignments or projects',
        ),
      ],
    },
    {
      heading: '3. Non-refundable items',
      blocks: [
        p('The following are strictly non-refundable:'),
        list(
          'Registration fees',
          'Processing fees',
          'GST and applicable taxes',
          'Digital learning materials',
          'Templates, toolkits, and prompt libraries',
          'Certification fees',
          'Third-party software or AI tool costs',
          'Application fees',
        ),
      ],
    },
    {
      heading: '4. Cancellation by skeo',
      blocks: [
        p('If skeo cancels a program before commencement and is unable to provide an alternative batch or access date, learners shall be eligible for:'),
        list('A full refund; or', 'Transfer to an alternative program or batch.'),
        p('In the event skeo is unable to deliver a program due to circumstances beyond its reasonable control (including but not limited to natural disasters, government action, platform outages, or internet failures), skeo shall offer an alternative access date or batch transfer. A refund shall be considered at skeo’s sole discretion.'),
      ],
    },
    {
      heading: '5. Refund processing',
      blocks: [
        p('Approved refunds shall be processed within 15–30 business days from the date of approval. Refunds shall be credited to the original payment instrument. Where this is not possible, an alternative method shall be mutually agreed upon.'),
      ],
    },
    {
      heading: '6. Dispute resolution',
      blocks: [
        p('Any disputes regarding refund decisions shall be subject to the governing law and jurisdiction as set out in skeo’s Terms & Conditions. The parties shall first attempt resolution through good-faith negotiation before initiating formal proceedings.'),
      ],
    },
    {
      heading: '7. Contact',
      blocks: [
        p('For refund-related requests, please write to support@skeoai.com.'),
        p('All refund requests must be submitted from the registered email address used during enrollment.'),
      ],
    },
    {
      heading: '8. Final decision',
      blocks: [
        p('All refund requests are reviewed individually. skeo’s decision shall be final, conclusive, and binding on the learner.'),
      ],
    },
  ],
}

export const terms: LegalDoc = {
  title: 'Terms & Conditions',
  summary:
    'The terms you agree to when you register for, purchase, or participate in any skeo program, platform, event, or community.',
  updated: '14 September 2026',
  intro: [
    p('By accessing, registering, purchasing, or participating in any skeo program, platform, event, or community, you agree to these Terms & Conditions, our Privacy Policy, and Refund Policy. If you do not agree with these Terms, please do not use our services.'),
  ],
  sections: [
    {
      heading: '1. Eligibility & account responsibility',
      blocks: [
        p('To use skeo’s services, you must:'),
        list(
          'Be at least 16 years of age.',
          'Provide accurate and complete information.',
          'Maintain the confidentiality of your account credentials.',
        ),
        p('You are responsible for all activity conducted through your account.'),
      ],
    },
    {
      heading: '2. Programs & payments',
      blocks: [
        p('skeo provides:'),
        list(
          'AI Tools Course',
          'Playbooks',
          'Pre-Recorded Programs',
          'Self-Paced Courses',
          'Certifications',
          'Community Access',
          'Jobs Board Access',
        ),
        p('Program fees are payable in full at the time of purchase. Failure to complete payment obligations may result in suspension of access to classes, communities, certifications, and other services. Refunds are governed solely by skeo’s Refund Policy.'),
      ],
    },
    {
      heading: '3. Program delivery',
      blocks: [
        p('Programs are delivered through pre-recorded lessons, assignments, projects, playbooks, community interactions, and digital learning platforms. skeo reserves the right to:'),
        list(
          'Modify schedules',
          'Reschedule sessions',
          'Update curriculum',
          'Replace instructors/mentors',
          'Improve program structure and content',
        ),
        p('skeo shall endeavour to provide reasonable advance notice of material changes where practicable. Such modifications shall not entitle the learner to cancellation, refund, or any other remedy.'),
      ],
    },
    {
      heading: '4. Intellectual property',
      blocks: [
        p('All content provided by skeo, including curriculum, recordings, projects, templates, prompt libraries, playbooks, assessments, certifications, and learning resources, is the intellectual property of Menler Learning Systems Private Limited or its licensors. You may not copy, distribute, record, resell, or publicly re-post this content without written permission.'),
      ],
    },
    {
      heading: '5. Learner conduct & academic integrity',
      blocks: [
        p('Learners are expected to maintain professional and respectful conduct. You agree not to:'),
        list(
          'Harass mentors, staff, hiring partners, or fellow learners',
          'Share access credentials',
          'Share proprietary learning materials externally',
          'Impersonate another person',
          'Engage in plagiarism, cheating, or fraudulent activity',
          'Use AI tools to generate, fabricate, or misrepresent submitted assignments, projects, or assessments without disclosure — which shall constitute academic fraud',
        ),
        p('skeo may review assignments, projects, and assessments for originality and may request demonstrations or explanations of submitted work. Violation of these standards may result in suspension, termination, removal from communities, withholding of certificates, or revocation of certifications without refund.'),
      ],
    },
    {
      heading: '6. Certifications',
      blocks: [
        p('Certificates may be awarded based on completion, assessments, assignments, projects, and participation requirements. skeo reserves the right to withhold, suspend, or revoke certifications in cases of misconduct, plagiarism, fraud, or violation of these Terms.'),
      ],
    },
    {
      heading: '7. Career support disclaimer',
      blocks: [
        p('skeo may provide networking opportunities, and access to a Job & Freelancing Board. All career support services do not constitute a guarantee or representation of employment. skeo does not guarantee:'),
        list(
          'Employment',
          'Internships',
          'Interviews',
          'Freelance opportunities',
          'Salary outcomes',
          'Career advancement',
        ),
        p('All hiring decisions rest exclusively with employers and hiring partners.'),
      ],
    },
    {
      heading: '8. Third-party services',
      blocks: [
        p('skeo may use third-party platforms, software, payment gateways, communication tools, and learning technologies. skeo is not responsible for the availability, security, or policies of such third-party services.'),
      ],
    },
    {
      heading: '9. Limitation of liability',
      blocks: [
        p('To the maximum extent permitted by law, skeo shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of its services. skeo’s total liability shall not exceed the fees paid by the learner for the specific program in the six (6) months preceding the claim.'),
      ],
    },
    {
      heading: '10. Indemnification',
      blocks: [
        p('Learners agree to indemnify and hold harmless skeo, its directors, employees, mentors, and partners from any claims, losses, liabilities, damages, or expenses (including legal fees) arising from the learner’s violation of these Terms, misuse of skeo’s platform, or any unlawful act or omission by the learner.'),
      ],
    },
    {
      heading: '11. Force majeure',
      blocks: [
        p('skeo shall not be liable for delays or non-performance caused by events beyond its reasonable control, including but not limited to natural disasters, government action, regulatory intervention, platform outages, or internet failures. In such circumstances, skeo shall endeavour to provide an alternative batch or a suitable remedy at its discretion.'),
      ],
    },
    {
      heading: '12. Suspension & termination',
      blocks: [
        p('skeo reserves the right to immediately suspend or permanently terminate access to its services if:'),
        list(
          'These Terms are violated',
          'Fraudulent activity is detected',
          'Payment obligations are not fulfilled',
          'User conduct negatively impacts the learning environment',
        ),
        p('Termination may occur without refund where permitted under applicable law.'),
      ],
    },
    {
      heading: '13. Dispute resolution',
      blocks: [
        p('In the event of any dispute arising out of or in connection with these Terms, the parties shall first attempt resolution through good-faith negotiation within 30 days of the dispute arising. If unresolved, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator appointed by mutual agreement, seated in Bengaluru, Karnataka.'),
      ],
    },
    {
      heading: '14. Governing law',
      blocks: [
        p('These Terms shall be governed by the laws of India. Subject to the dispute resolution clause above, any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.'),
      ],
    },
    {
      heading: '15. Severability',
      blocks: [
        p('If any provision of these Terms is found to be invalid, illegal, or unenforceable under applicable law, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it enforceable.'),
      ],
    },
  ],
}
