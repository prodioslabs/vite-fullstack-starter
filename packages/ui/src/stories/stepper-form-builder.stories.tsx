import { Meta, StoryObj } from '@storybook/react'
import { z } from 'zod'
import { StepperFormBuilder } from '../components/stepper-form-builder/stepper-form-builder'

export default {
  component: StepperFormBuilder,
} satisfies Meta<typeof StepperFormBuilder>

type Story = StoryObj<typeof StepperFormBuilder>

export const StepperForm: Story = {
  decorators: (Story) => (
    <div className="mx-auto max-w-screen-xl">
      <Story />
    </div>
  ),
  args: {
    config: {
      steps: {
        profile: {
          name: 'Profile',
          description: 'This information will be displayed publicly so be careful what you share.',
          form: {
            subforms: [
              {
                id: 'profile',
                name: 'Profile',
                description: 'This information will be displayed publicly so be careful what you share.',
                fields: [
                  {
                    id: 'firstName',
                    name: 'First Name',
                    type: 'text',
                    placeholder: 'First Name',
                    className: 'col-span-6',
                  },
                  {
                    id: 'lastName',
                    name: 'Last Name',
                    type: 'text',
                    placeholder: 'Last Name',
                    className: 'col-span-6',
                  },
                  {
                    id: 'email',
                    name: 'Email Address',
                    type: 'text',
                    className: 'col-span-9',
                  },
                ],
              },
              {
                id: 'address',
                name: 'Address',
                description: 'This information will be used to send you physical mail.',
                fields: [
                  {
                    id: 'street',
                    name: 'Street Address',
                    type: 'text',
                    placeholder: 'Street Address',
                    className: 'col-span-6',
                  },
                  {
                    id: 'city',
                    name: 'City',
                    type: 'text',
                    placeholder: 'City',
                    className: 'col-span-6',
                  },
                  {
                    id: 'state',
                    name: 'State',
                    type: 'text',
                    placeholder: 'State',
                    className: 'col-span-3',
                  },
                  {
                    id: 'zip',
                    name: 'Zip Code',
                    type: 'text',
                    placeholder: 'Zip Code',
                    className: 'col-span-3',
                  },
                ],
              },
            ],
            validationSchema: z.object({
              profile: z.object({
                firstName: z.string().min(2).max(50),
                lastName: z.string().min(2).max(50),
                email: z.string().email(),
              }),
              address: z.object({
                street: z.string().min(2).max(50),
                city: z.string().min(2).max(50),
                state: z.string().min(2).max(50),
                zip: z.string().min(2).max(50),
              }),
            }),
          },
        },
        account: {
          name: 'Account',
          description: 'This information will be used to log in to your account.',
          form: {
            subforms: [
              {
                id: 'account',
                name: 'Account',
                description: 'This information will be used to log in to your account.',
                fields: [
                  {
                    id: 'username',
                    name: 'Username',
                    type: 'text',
                    placeholder: 'Username',
                    className: 'col-span-6',
                  },
                  {
                    id: 'password',
                    name: 'Password',
                    type: 'text',
                    inputType: 'password',
                    placeholder: 'Password',
                    className: 'col-span-6',
                  },
                ],
              },
            ],
            validationSchema: z.object({
              account: z.object({
                username: z.string().min(2).max(50),
                password: z.string().min(8),
              }),
            }),
          },
        },
      },
      stepOrder: ['profile', 'account'],
    },
    onSubmit: (values) => {
      // eslint-disable-next-line no-console
      console.log(values)
    },
  },
}

export const ApplicationForRegistrationOfMarriage: Story = {
  decorators: (Story) => (
    <div className="mx-auto max-w-screen-xl">
      <Story />
    </div>
  ),
  args: {
    config: {
      steps: {
        registrationDetails: {
          name: 'Registration Details',
          form: {
            subforms: [
              {
                id: 'registrationDetails',
                name: 'Registration Details',
                fields: [
                  {
                    id: 'marriageRegistrationType',
                    name: 'Marriage Registration Type',
                    type: 'select',
                    onChange(values, setValues) {
                      setValues('registrationDetails.marriageSolemnizedDate', undefined)
                      setValues('registrationDetails.isMarriageRegistered', undefined)
                      setValues('registrationDetails.registeredInWhichAct', undefined)
                      setValues('registrationDetails.registeredInWhichAct2', undefined)
                      setValues('registrationDetails.actName', undefined)
                    },
                    options: [
                      {
                        value: '1',
                        name: 'Marriage solemnized/ contracted before the commencement of the Uniform Civil Code, Uttarakhand, 2024',
                      },
                      {
                        value: '2',
                        name: 'Marriage solemnized/ contracted after the commencement of the Uniform Civil Code, Uttarakhand, 2024',
                      },
                    ],

                    className: 'col-span-full',
                  },
                  {
                    id: 'marriageSolemnizedDate',
                    name: 'When was the marriage solemnized/ contracted?',
                    type: 'select',
                    hidden: (values) => values.registrationDetails?.marriageRegistrationType !== '1',
                    onChange: (values, setValues) => {
                      setValues('registrationDetails.isMarriageRegistered', '')
                    },
                    options: [
                      {
                        value: '1',
                        name: 'Before 26.03.10',
                      },
                      {
                        value: '2',
                        name: 'On or after 26.03.10',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'isMarriageRegistered',
                    name: 'Whether the marriage been registered under any Act?',
                    type: 'select',
                    onChange: (values, setValues) => {
                      setValues('registrationDetails.actName', undefined)
                    },
                    hidden: (values) => values.registrationDetails?.marriageRegistrationType !== '1',
                    options: [
                      {
                        value: 'yes',
                        name: 'Yes',
                      },
                      {
                        value: 'no',
                        name: 'No',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'registeredInWhichAct',
                    name: 'Marriage registered under which Act?',
                    type: 'select',
                    hidden(values) {
                      return !(
                        values.registrationDetails?.isMarriageRegistered === 'yes' &&
                        values.registrationDetails?.marriageSolemnizedDate === '1'
                      )
                    },
                    onChange: (values, setValues) => {
                      setValues('registrationDetails.actName', '')
                    },
                    options: [
                      {
                        value: '1',
                        name: 'Special Marriage Act, 1954',
                      },
                      {
                        value: '2',
                        name: 'Uttar Pradesh Hindu Marriage (Registration) Rules, 1973',
                      },
                      {
                        value: '3',
                        name: 'Christian Marriage and Divorce Act, 1950',
                      },
                      {
                        value: '4',
                        name: 'Parsi Marriage and Divorce Act, 1936',
                      },
                      {
                        value: '5',
                        name: 'Arya Marriage Validation Act, 1937',
                      },
                      {
                        value: '6',
                        name: 'Anand Marriage Act, 1909',
                      },
                      {
                        value: '7',
                        name: 'Any other Acts',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'registeredInWhichAct2',
                    name: 'Marriage registered under which Act?',
                    type: 'select',
                    hidden(values) {
                      return !(
                        values.registrationDetails?.isMarriageRegistered === 'yes' &&
                        values.registrationDetails?.marriageSolemnizedDate === '2'
                      )
                    },
                    onChange: (values, setValues) => {
                      setValues('registrationDetails.actName', undefined)
                    },
                    options: [
                      {
                        value: '1',
                        name: 'Uttarakhand Compulsory Registration of Marriage Act, 2010',
                      },
                      {
                        value: '2',
                        name: 'Special Marriage Act, 1954',
                      },
                      {
                        value: '3',
                        name: 'Christian Marriage and Divorce Act, 1957',
                      },
                      {
                        value: '4',
                        name: 'Parsi Marriage and Divorce Act, 1936',
                      },
                      {
                        value: '5',
                        name: 'Arya Marriage Validation Act, 1937',
                      },
                      {
                        value: '6',
                        name: 'Anand Marriage Act, 1909',
                      },
                      {
                        value: '7',
                        name: 'Any other Acts',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'actName',
                    name: 'Name of the Act',
                    type: 'text',
                    className: 'col-span-6',

                    hidden(values) {
                      return values.registrationDetails?.registeredInWhichAct !== '7'
                    },
                  },
                  {
                    id: 'residentOfUttarakhand',
                    name: 'Which of the partner(s) is the resident of Uttarakhand?',
                    type: 'select',
                    options: [
                      {
                        value: 'wife',
                        name: 'Wife',
                      },
                      {
                        value: 'husband',
                        name: 'Husband',
                      },
                      {
                        value: 'both',
                        name: 'Both',
                      },
                    ],
                    hidden: (values) => values.registrationDetails?.marriageRegistrationType !== '2',
                  },
                  {
                    id: 'residentProof',
                    name: 'Upload the Proof',
                    type: 'text',
                    hidden: (values) => {
                      return !(
                        values.registrationDetails?.marriageRegistrationType === '2' &&
                        values.registrationDetails?.residentOfUttarakhand === 'both'
                      )
                    },
                  },
                  {
                    id: 'residentCategory',
                    name: 'In which category of residency does the selected partner fall?',
                    type: 'select',
                    hidden: (values) => {
                      return !(
                        values.registrationDetails?.marriageRegistrationType === '2' &&
                        values.registrationDetails?.residentOfUttarakhand === 'both'
                      )
                    },
                    options: [
                      {
                        value: 'permanentResident',
                        name: 'Permanent Resident',
                      },
                      {
                        value: 'stateEmployee',
                        name: 'State Employee',
                      },
                      {
                        value: 'centralEmployee',
                        name: 'Central Employee',
                      },
                      {
                        value: 'residingOneYear',
                        name: 'Residing for one year',
                      },
                      {
                        value: 'beneficiary',
                        name: 'Beneficiary of any scheme',
                      },
                    ],
                  },
                  {
                    id: 'residencyWifeCategory',
                    name: 'In which category of residency does the wife fall?',
                    type: 'select',
                    hidden: (values) => {
                      return !(
                        values.registrationDetails?.marriageRegistrationType === '2' &&
                        values.registrationDetails?.residentOfUttarakhand === 'wife'
                      )
                    },
                    options: [
                      {
                        value: 'permanentResident',
                        name: 'Permanent Resident',
                      },
                      {
                        value: 'stateEmployee',
                        name: 'State Employee',
                      },
                      {
                        value: 'centralEmployee',
                        name: 'Central Employee',
                      },
                      {
                        value: 'residingOneYear',
                        name: 'Residing for one year',
                      },
                      {
                        value: 'beneficiary',
                        name: 'Beneficiary of any scheme',
                      },
                    ],
                  },
                  {
                    id: 'residencyWifeProof',
                    name: 'Upload the Proof',
                    type: 'text',
                    hidden: (values) => {
                      return !(
                        values.registrationDetails?.marriageRegistrationType === '2' &&
                        values.registrationDetails?.residentOfUttarakhand !== 'both'
                      )
                    },
                  },
                  {
                    id: 'residencyWifeProof',
                    name: 'Upload the Proof',
                    type: 'text',
                    hidden: (values) => {
                      return !(
                        values.registrationDetails?.marriageRegistrationType === '2' &&
                        values.registrationDetails?.residentOfUttarakhand === 'both'
                      )
                    },
                  },
                  {
                    id: 'residencyHusbandCategory',
                    name: 'In which category of residency does the husband fall?',
                    type: 'select',
                    hidden: (values) => {
                      return !(
                        values.registrationDetails?.marriageRegistrationType === '2' &&
                        values.registrationDetails?.residentOfUttarakhand === 'both'
                      )
                    },
                    options: [
                      {
                        value: 'permanentResident',
                        name: 'Permanent Resident',
                      },
                      {
                        value: 'stateEmployee',
                        name: 'State Employee',
                      },
                      {
                        value: 'centralEmployee',
                        name: 'Central Employee',
                      },
                      {
                        value: 'residingOneYear',
                        name: 'Residing for one year',
                      },
                      {
                        value: 'beneficiary',
                        name: 'Beneficiary of any scheme',
                      },
                    ],
                  },
                  {
                    id: 'residencyHusbandProof',
                    name: 'Upload the Proof',
                    type: 'text',
                    hidden: (values) => {
                      return !(
                        values.registrationDetails?.marriageRegistrationType === '2' &&
                        values.registrationDetails?.residentOfUttarakhand === 'both'
                      )
                    },
                  },
                ],
              },
            ],
            validationSchema: z.object({
              registrationDetails: z.object({
                marriageRegistrationType: z.string().optional(),
                marriageSolemnizedDate: z.string().optional(),
                isMarriageRegistered: z.string().optional(),
                registeredInWhichAct: z.string().optional(),
                registeredInWhichAct2: z.string().optional(),
                actName: z.string().optional(),
              }),
            }),
          },
        },
        wifeDetails: {
          name: 'Wife Details',
          form: {
            subforms: [
              {
                id: 'wifeDetails',
                name: 'Wife Details',
                fields: [
                  {
                    id: 'wifeAadhaarConsent',
                    name: 'wifeAadhaarConsent',
                    isNameHidden: true,
                    label:
                      'I, hereby, give my consent to the Government of Uttarakhand to use my Aadhaar details to establish and authenticate my identity for the registration of marriage.',
                    type: 'checkbox',
                  },
                  {
                    id: 'wifeAadhaarNumber',
                    name: 'Aadhaar Number of Wife',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeName',
                    name: 'Name of Wife',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeBirthDate',
                    name: 'Date of Birth of Wife',
                    type: 'date',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeGender',
                    name: 'Gender',
                    type: 'select',
                    options: [
                      {
                        value: 'Female',
                        name: 'Female',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeAge',
                    name: 'Age of Wife',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeGuardianType',
                    name: 'Guardian Type',
                    type: 'select',
                    options: [
                      {
                        value: 'parents',
                        name: 'Parents',
                      },
                      {
                        value: 'legalGuardian',
                        name: 'Legal Guardian',
                      },
                    ],
                    onChange: (values, setValues) => {
                      setValues('wifeDetails.wifeFatherName', undefined)
                      setValues('wifeDetails.wifeMotherName', undefined)
                      setValues('wifeDetails.wifeGuardianName', undefined)
                    },
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeMotherName',
                    name: "Mother's Name",
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.wifeDetails?.wifeGuardianType !== 'parents',
                  },
                  {
                    id: 'wifeFatherName',
                    name: "Father's Name",
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.wifeDetails?.wifeGuardianType !== 'parents',
                  },
                  {
                    id: 'wifeGuardianName',
                    name: 'Guardian Name',
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.wifeDetails?.wifeGuardianType !== 'legalGuardian',
                  },
                  {
                    id: 'wifeNationality',
                    name: 'Nationality',
                    type: 'select',
                    options: [
                      {
                        value: 'demo',
                        name: 'Demo',
                      },
                      {
                        value: 'indian',
                        name: 'Indian',
                      },
                    ],
                    className: 'col-span-6',
                    onChange(values, setValues) {
                      setValues('wifeDetails.wifeSpecifyReligion', undefined)
                      setValues('wifeDetails.wifeCategory', undefined)
                    },
                  },
                  {
                    id: 'wifeSpecifyReligion',
                    name: 'Specify Religion',
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.wifeDetails?.wifeNationality !== '10',
                  },
                  {
                    id: 'wifeCategory',
                    name: 'Category',
                    type: 'select',
                    onChange: (values, setValues) => {
                      setValues('wifeDetails.wifeStConsent', undefined)
                    },
                    hidden: (values) => values.wifeDetails?.wifeNationality !== 'indian',
                    options: [
                      {
                        value: 'general',
                        name: 'General',
                      },
                      {
                        value: 'sc',
                        name: 'SC',
                      },
                      {
                        value: 'st',
                        name: 'ST',
                      },
                      {
                        value: 'obc',
                        name: 'OBC',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeStConsent',
                    type: 'checkbox',
                    name: 'wifeStConsent',
                    isNameHidden: true,
                    label:
                      'Notwithstanding anything mentioned under Section 2 of the Uniform Civil Code, Uttarakhand 2024. I, being a member of a Scheduled Tribe, hereby solemnly affirm and declare that I am voluntarily filling and submitting the memorandum for marriage registration in order to register my marriage under the aforementioned Code.',
                    hidden: (values) => values.wifeDetails?.wifeCategory !== 'st',
                  },
                  {
                    id: 'wifeMaritalStatusAtMarriage',
                    name: 'Marital Status at the time of Marriage',
                    type: 'select',
                    hidden(values) {
                      return values.registrationDetails?.marriageRegistrationType !== '2'
                    },
                    options: [
                      {
                        value: 'unmarried',
                        name: 'Unmarried',
                      },
                      {
                        value: 'married',
                        name: 'Married',
                      },
                      {
                        value: 'divorcee',
                        name: 'Divorcee',
                      },
                      {
                        value: 'annulled',
                        name: 'Annulled',
                      },
                      {
                        value: 'widow',
                        name: 'Widow',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeDivorceSelection',
                    name: 'Divorcee Selection',
                    type: 'select',
                    hidden(values) {
                      return values.wifeDetails?.wifeMaritalStatusAtMarriage !== 'divorcee'
                    },
                    options: [
                      {
                        value: '1',
                        name: 'Judgement Number of Decree of Divorce',
                      },
                      {
                        value: '2',
                        name: 'Acknowledgement Certificate Number for Decree of Divorce (if registered under UCC)',
                      },
                    ],
                    className: 'col-span-6',
                  },

                  {
                    id: 'wifeDivorceCaseNumber',
                    name: 'Case Number',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeDivorceSelection !== '1',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeDivorceCaseYear',
                    name: 'Year',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeDivorceSelection !== '1',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeDivorceCNRNumber',
                    name: 'CNR Number',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeDivorceSelection !== '1',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeDivorceeDocument',
                    name: 'Upload the Document',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeDivorceSelection !== '1',
                  },
                  {
                    id: 'wifeAnnulledSelection',
                    name: 'Annulled Selection',
                    type: 'select',
                    hidden: (values) => values.wifeDetails?.wifeMaritalStatusAtMarriage !== 'annulled',
                    options: [
                      {
                        value: '1',
                        name: 'Judgement Number of Decree of Nullity',
                      },
                      {
                        value: '2',
                        name: 'Acknowledgement Certificate Number for Decree of Nullity (if registered under UCC)',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeAnnulledCaseNumber',
                    name: 'Case Number',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeAnnulledSelection !== '1',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeAnnulledCaseYear',
                    name: 'Year',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeAnnulledSelection !== '1',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeAnnulledCNRNumber',
                    name: 'CNR Number',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeAnnulledSelection !== '1',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeAnnulledDocument',
                    name: 'Upload the Document',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeAnnulledSelection !== '1',
                  },

                  {
                    id: 'wifeDivorceAcknowledgementNumber',
                    name: 'Acknowledgement Certificate Number',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeDivorceSelection !== '2',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeAnnulledAcknowledgementNumber',
                    name: 'Acknowledgement Certificate Number',
                    type: 'text',
                    hidden: (values) => values.wifeDetails?.wifeAnnulledSelection !== '2',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeMobileNumber',
                    name: 'Mobile Number (Linked with Aadhaar)',
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => {
                      return !(
                        values.wifeDetails?.wifeMaritalStatusAtMarriage === 'widow' ||
                        values.registrationDetails?.isMarriageRegistered === 'yes'
                      )
                    },
                  },
                  {
                    id: 'wifeOtherNumber',
                    name: 'Alternate Mobile No',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeMailId',
                    name: 'Email ID',
                    type: 'text',
                    className: 'col-span-6',
                  },
                ],
              },
            ],
            validationSchema: z.object({}),
          },
        },
        wifePresentAddress: {
          name: 'Present Address (Wife)',
          form: {
            subforms: [
              {
                id: 'wifePresentAddress',
                name: 'Wife Present Address',
                fields: [
                  {
                    id: 'wifeState',
                    name: 'State',
                    type: 'select',
                    options: [
                      {
                        value: 'demo',
                        name: 'Demo',
                      },
                      {
                        value: 'uttarakhand',
                        name: 'Uttarakhand',
                      },
                    ],
                    className: 'col-span-6',
                    onChange(values, setValues) {
                      setValues('wifePresentAddress.wifeUKDistrict', undefined)
                      setValues('wifePresentAddress.wifeTehsil', undefined)
                      setValues('wifePresentAddress.wifeArea', undefined)
                      setValues('wifePresentAddress.wifeBlock', undefined)
                      setValues('wifePresentAddress.wifeGramPanchayat', undefined)
                      setValues('wifePresentAddress.wifeVillage', undefined)
                      setValues('wifePresentAddress.wifeMunicipalArea', undefined)
                      setValues('wifePresentAddress.wifeUKPinCode', undefined)
                      setValues('wifePresentAddress.wifeUKFullAddress', undefined)
                      setValues('wifePresentAddress.wifeOtherDistrict', undefined)
                      setValues('wifePresentAddress.wifeOtherPinCode', undefined)
                      setValues('wifePresentAddress.wifeOtherFullAddress', undefined)
                      setValues('wifePresentAddress.wifeCantonmentBoard', undefined)
                    },
                  },
                  {
                    id: 'wifeUKDistrict',
                    name: 'District',
                    type: 'select',
                    hidden: (values) => values.wifePresentAddress?.wifeState !== 'uttarakhand',
                    options: [
                      {
                        value: 'demoDistrict',
                        name: 'Demo District',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeTehsil',
                    name: 'Tehsil',
                    type: 'select',
                    hidden: (values) => values.wifePresentAddress?.wifeState !== 'uttarakhand',
                    options: [
                      {
                        value: 'demoTehsil',
                        name: 'Demo Tehsil',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeArea',
                    name: 'Area',
                    type: 'select',
                    hidden: (values) => values.wifePresentAddress?.wifeState !== 'uttarakhand',
                    options: [
                      {
                        value: 'rural',
                        name: 'Rural',
                      },
                      {
                        value: 'urban',
                        name: 'Urban',
                      },
                      {
                        value: 'cantonment',
                        name: 'Cantonment Board',
                      },
                    ],
                    className: 'col-span-6',
                    onChange(values, setValues) {
                      setValues('wifePresentAddress.wifeCantonmentBoard', undefined)
                      setValues('wifePresentAddress.wifeBlock', undefined)
                      setValues('wifePresentAddress.wifeGramPanchayat', undefined)
                      setValues('wifePresentAddress.wifeVillage', undefined)
                      setValues('wifePresentAddress.wifeMunicipalArea', undefined)
                    },
                  },
                  {
                    id: 'wifeBlock',
                    name: 'Block',
                    type: 'select',
                    hidden: (values) => values.wifePresentAddress?.wifeArea !== 'rural',
                    options: [
                      {
                        value: 'demoBlock',
                        name: 'Demo Block',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeGramPanchayat',
                    name: 'Gram Panchayat',
                    type: 'select',
                    hidden: (values) => values.wifePresentAddress?.wifeArea !== 'rural',
                    options: [
                      {
                        value: 'demoGramPanchayat',
                        name: 'Demo Gram Panchayat',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeVillage',
                    name: 'Village',
                    type: 'select',
                    hidden: (values) => values.wifePresentAddress?.wifeArea !== 'rural',
                    options: [
                      {
                        value: 'demoVillage',
                        name: 'Demo Village',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeMunicipalArea',
                    name: 'Municipal Area',
                    type: 'select',
                    hidden: (values) => values.wifePresentAddress?.wifeArea !== 'urban',
                    options: [
                      {
                        value: 'demoMunicipalArea',
                        name: 'Demo Municipal Area',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeCantonmentBoard',
                    name: 'Cantonment Board',
                    hidden: (values) => values.wifePresentAddress?.wifeArea !== 'cantonment',
                    type: 'select',
                    options: [
                      {
                        value: 'demoCantonmentBoard',
                        name: 'Demo Cantonment Board',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeUKPinCode',
                    name: 'Pin Code',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifeUKFullAddress',
                    name: 'Full Address',
                    type: 'text',
                    className: 'col-span-full',
                  },
                  {
                    id: 'wifeOtherDistrict',
                    name: 'District',
                    type: 'select',
                    options: [
                      {
                        value: 'demoDistrict',
                        name: 'Demo District',
                      },
                    ],
                    className: 'col-span-6',
                    hidden: (values) => values.wifePresentAddress?.wifeState === 'uttarakhand',
                  },
                  {
                    id: 'wifeOtherPinCode',
                    name: 'Pin Code',
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.wifePresentAddress?.wifeState === 'uttarakhand',
                  },
                  {
                    id: 'wifeOtherFullAddress',
                    name: 'Full Address',
                    type: 'text',
                    className: 'col-span-full',
                    hidden: (values) => values.wifePresentAddress?.wifeState === 'uttarakhand',
                  },
                ],
              },
            ],
            validationSchema: z.object({}),
          },
        },
        wifePermanentAddress: {
          name: 'Permanent Address (Wife)',
          form: {
            subforms: [
              {
                id: 'wifePermanentAddress',
                name: 'Wife Permanent Address',
                fields: [
                  {
                    id: 'wifePermanentAddressSameAsPresent',
                    label: 'Is Permanent Address same as Present Address?',
                    type: 'checkbox',
                    onChange(values, setValues) {
                      if (values.wifePermanentAddress?.wifePermanentAddressSameAsPresent) {
                        setValues('wifePermanentAddress.wifePermanentState', values.wifePresentAddress?.wifeState)
                        setValues(
                          'wifePermanentAddress.wifePermanentUKDistrict',
                          values.wifePresentAddress?.wifeUKDistrict,
                        )
                        setValues('wifePermanentAddress.wifePermanentTehsil', values.wifePresentAddress?.wifeTehsil)
                        setValues('wifePermanentAddress.wifePermanentArea', values.wifePresentAddress?.wifeArea)
                        setValues('wifePermanentAddress.wifePermanentBlock', values.wifePresentAddress?.wifeBlock)
                        setValues(
                          'wifePermanentAddress.wifePermanentGramPanchayat',
                          values.wifePresentAddress?.wifeGramPanchayat,
                        )
                        setValues('wifePermanentAddress.wifePermanentVillage', values.wifePresentAddress?.wifeVillage)
                        setValues(
                          'wifePermanentAddress.wifePermanentMunicipalArea',
                          values.wifePresentAddress?.wifeMunicipalArea,
                        )
                        setValues(
                          'wifePermanentAddress.wifePermanentCantonmentBoard',
                          values.wifePresentAddress?.wifeCantonmentBoard,
                        )
                        setValues(
                          'wifePermanentAddress.wifePermanentUKPinCode',
                          values.wifePresentAddress?.wifeUKPinCode,
                        )
                        setValues(
                          'wifePermanentAddress.wifePermanentUKFullAddress',
                          values.wifePresentAddress?.wifeUKFullAddress,
                        )
                        setValues(
                          'wifePermanentAddress.wifePermanentOtherDistrict',
                          values.wifePresentAddress?.wifeOtherDistrict,
                        )
                        setValues(
                          'wifePermanentAddress.wifePermanentOtherPinCode',
                          values.wifePresentAddress?.wifeOtherPinCode,
                        )
                        setValues(
                          'wifePermanentAddress.wifePermanentOtherFullAddress',
                          values.wifePresentAddress?.wifeOtherFullAddress,
                        )
                      } else {
                        setValues('wifePermanentAddress.wifePermanentState', undefined)
                        setValues('wifePermanentAddress.wifePermanentUKDistrict', undefined)
                        setValues('wifePermanentAddress.wifePermanentTehsil', undefined)
                        setValues('wifePermanentAddress.wifePermanentArea', undefined)
                        setValues('wifePermanentAddress.wifePermanentBlock', undefined)
                        setValues('wifePermanentAddress.wifePermanentGramPanchayat', undefined)
                        setValues('wifePermanentAddress.wifePermanentVillage', undefined)
                        setValues('wifePermanentAddress.wifePermanentMunicipalArea', undefined)
                        setValues('wifePermanentAddress.wifePermanentCantonmentBoard', undefined)
                        setValues('wifePermanentAddress.wifePermanentUKPinCode', undefined)
                        setValues('wifePermanentAddress.wifePermanentUKFullAddress', undefined)
                        setValues('wifePermanentAddress.wifePermanentOtherDistrict', undefined)
                        setValues('wifePermanentAddress.wifePermanentOtherPinCode', undefined)
                        setValues('wifePermanentAddress.wifePermanentOtherFullAddress', undefined)
                      }
                    },
                  },
                  {
                    id: 'wifePermanentState',
                    name: 'State',
                    type: 'select',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    options: [
                      {
                        value: 'demo',
                        name: 'Demo',
                      },
                      {
                        value: 'uttarakhand',
                        name: 'Uttarakhand',
                      },
                    ],
                    onChange(values, setValues) {
                      setValues('wifePermanentAddress.wifePermanentUKDistrict', undefined)
                      setValues('wifePermanentAddress.wifePermanentTehsil', undefined)
                      setValues('wifePermanentAddress.wifePermanentArea', undefined)
                      setValues('wifePermanentAddress.wifePermanentBlock', undefined)
                      setValues('wifePermanentAddress.wifePermanentGramPanchayat', undefined)
                      setValues('wifePermanentAddress.wifePermanentVillage', undefined)
                      setValues('wifePermanentAddress.wifePermanentMunicipalArea', undefined)
                      setValues('wifePermanentAddress.wifePermanentCantonmentBoard', undefined)
                      setValues('wifePermanentAddress.wifePermanentUKPinCode', undefined)
                      setValues('wifePermanentAddress.wifePermanentUKFullAddress', undefined)
                      setValues('wifePermanentAddress.wifePermanentOtherDistrict', undefined)
                      setValues('wifePermanentAddress.wifePermanentOtherPinCode', undefined)
                      setValues('wifePermanentAddress.wifePermanentOtherFullAddress', undefined)
                    },
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifePermanentUKDistrict',
                    name: 'District',
                    type: 'select',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentState !== 'uttarakhand',
                    options: [
                      {
                        value: 'demoDistrict',
                        name: 'Demo District',
                      },
                    ],
                    className: 'col-span-6',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                  },
                  {
                    id: 'wifePermanentTehsil',
                    name: 'Tehsil',
                    type: 'select',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentState !== 'uttarakhand',
                    options: [
                      {
                        value: 'demoTehsil',
                        name: 'Demo Tehsil',
                      },
                    ],
                    className: 'col-span-6',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                  },
                  {
                    id: 'wifePermanentArea',
                    name: 'Area',
                    type: 'select',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentState !== 'uttarakhand',
                    options: [
                      {
                        value: 'rural',
                        name: 'Rural',
                      },
                      {
                        value: 'urban',
                        name: 'Urban',
                      },
                      {
                        value: 'cantonment',
                        name: 'Cantonment Board',
                      },
                    ],
                    className: 'col-span-6',
                    onChange(values, setValues) {
                      setValues('wifePermanentAddress.wifePermanentCantonmentBoard', undefined)
                      setValues('wifePermanentAddress.wifePermanentBlock', undefined)
                      setValues('wifePermanentAddress.wifePermanentGramPanchayat', undefined)
                      setValues('wifePermanentAddress.wifePermanentVillage', undefined)
                      setValues('wifePermanentAddress.wifePermanentMunicipalArea', undefined)
                    },
                  },
                  {
                    id: 'wifePermanentBlock',
                    name: 'Block',
                    type: 'select',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    options: [
                      {
                        value: 'demoBlock',
                        name: 'Demo Block',
                      },
                    ],
                    className: 'col-span-6',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentArea !== 'rural',
                  },
                  {
                    id: 'wifePermanentGramPanchayat',
                    name: 'Gram Panchayat',
                    type: 'select',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    options: [
                      {
                        value: 'demoGramPanchayat',
                        name: 'Demo Gram Panchayat',
                      },
                    ],
                    className: 'col-span-6',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentArea !== 'rural',
                  },
                  {
                    id: 'wifePermanentVillage',
                    name: 'Village',
                    type: 'select',
                    options: [
                      {
                        value: 'demoVillage',
                        name: 'Demo Village',
                      },
                    ],
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    className: 'col-span-6',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentArea !== 'rural',
                  },
                  {
                    id: 'wifePermanentMunicipalArea',
                    name: 'Municipal Area',
                    type: 'select',
                    options: [
                      {
                        value: 'demoMunicipalArea',
                        name: 'Demo Municipal Area',
                      },
                    ],
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    className: 'col-span-6',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentArea !== 'urban',
                  },
                  {
                    id: 'wifePermanentCantonmentBoard',
                    name: 'Cantonment Board',
                    type: 'select',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentArea !== 'cantonment',
                    options: [
                      {
                        value: 'demoCantonmentBoard',
                        name: 'Demo Cantonment Board',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'wifePermanentUKPinCode',
                    name: 'Pin Code',
                    type: 'text',
                    className: 'col-span-6',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                  },
                  {
                    id: 'wifePermanentUKFullAddress',
                    name: 'Full Address',
                    type: 'text',
                    className: 'col-span-full',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                  },
                  {
                    id: 'wifePermanentOtherDistrict',
                    name: 'District',
                    type: 'text',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    className: 'col-span-6',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentState === 'uttarakhand',
                  },
                  {
                    id: 'wifePermanentOtherPinCode',
                    name: 'Pin Code',
                    type: 'text',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    className: 'col-span-6',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentState === 'uttarakhand',
                  },
                  {
                    id: 'wifePermanentOtherFullAddress',
                    name: 'Full Address',
                    type: 'text',
                    disabled: (values) => values.wifePermanentAddress?.wifePermanentAddressSameAsPresent,
                    className: 'col-span-full',
                    hidden: (values) => values.wifePermanentAddress?.wifePermanentState === 'uttarakhand',
                  },
                ],
              },
            ],
            validationSchema: z.object({}),
          },
        },
        husbandDetails: {
          name: 'Husband Details',
          form: {
            subforms: [
              {
                id: 'husbandDetails',
                name: 'Details of husband',
                fields: [
                  {
                    id: 'HusbandAadhaarConsent',
                    name: 'I, hereby, give my consent to the Government of Uttarakhand to use my Aadhaar details to establish and authenticate my identity for the registration of marriage.',
                    type: 'checkbox',
                  },
                  {
                    id: 'husbandAadhaarNumber',
                    name: 'Aadhaar Number of Husband',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandName',
                    name: 'Name of Husband',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandBirthDate',
                    name: 'Date of Birth of Husband',
                    type: 'date',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandGender',
                    name: 'Gender',
                    type: 'select',
                    options: [
                      {
                        name: 'Male',
                        value: 'male',
                      },
                    ],
                  },
                  {
                    id: 'husbandAge',
                    name: 'Age of Husband',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandGuardianType',
                    name: 'Guardian Type',
                    type: 'select',
                    options: [
                      {
                        value: 'parents',
                        name: 'Parents',
                      },
                      {
                        value: 'legalGuardian',
                        name: 'Legal Guardian',
                      },
                    ],
                    onChange(values, setValues) {
                      setValues('husbandDetails.husbandFatherName', undefined)
                      setValues('husbandDetails.husbandMotherName', undefined)
                      setValues('husbandDetails.husbandGuardianName', undefined)
                    },
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandMotherName',
                    name: "Mother's Name",
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.husbandDetails?.husbandGuardianType !== 'parents',
                  },
                  {
                    id: 'husbandFatherName',
                    name: "Father's Name",
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.husbandDetails?.husbandGuardianType !== 'parents',
                  },
                  {
                    id: 'husbandGuardianName',
                    name: 'Guardian Name',
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.husbandDetails?.husbandGuardianType !== 'legalGuardian',
                  },
                  {
                    id: 'husbandNationality',
                    name: 'Nationality',
                    type: 'select',
                    options: [
                      {
                        value: 'indian',
                        name: 'Indian',
                      },
                      {
                        value: 'others',
                        name: 'Others',
                      },
                    ],
                    onChange(values, setValues) {
                      setValues('husbandDetails.husbandSpecifyReligion', undefined)
                      setValues('husbandDetails.husbandCategory', undefined)
                    },
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandReligion',
                    name: 'Religion',
                    type: 'select',
                    className: 'col-span-6',
                    options: [
                      {
                        value: '1',
                        name: 'Hinduism',
                      },
                      {
                        value: '2',
                        name: 'Christianity',
                      },
                      {
                        value: '3',
                        name: 'Islam',
                      },
                      {
                        value: '4',
                        name: 'Sikhism',
                      },
                      {
                        value: '5',
                        name: 'Jainism',
                      },
                      {
                        value: '6',
                        name: 'Buddhism',
                      },
                      {
                        value: '7',
                        name: 'Zoroastrianism',
                      },
                      {
                        value: '8',
                        name: 'Judaism',
                      },
                      {
                        value: '9',
                        name: 'Atheism',
                      },
                      {
                        value: '10',
                        name: 'Others',
                      },
                    ],
                  },
                  {
                    id: 'husbandSpecifyReligion',
                    name: 'Specify Religion',
                    type: 'text',
                    className: 'col-span-6',
                    hidden: (values) => values.husbandDetails?.husbandReligion !== '10',
                  },
                  {
                    id: 'husbandCategory',
                    name: 'Category',
                    type: 'select',
                    onChange(values, setValues) {
                      setValues('husbandDetails.husbandStConsent', undefined)
                    },
                    hidden: (values) => values.husbandDetails?.husbandNationality !== 'indian',
                    options: [
                      {
                        value: '1',
                        name: 'General',
                      },
                      {
                        value: '2',
                        name: 'SC',
                      },
                      {
                        value: '3',
                        name: 'ST',
                      },
                      {
                        value: '4',
                        name: 'OBC',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandStConsent',
                    type: 'checkbox',
                    isNameHidden: true,
                    hidden: (values) => values.husbandDetails?.husbandCategory !== '3',
                    label:
                      'Notwithstanding anything mentioned under Section 2 of the Uniform Civil Code, Uttarakhand 2024. I, being a member of a Scheduled Tribe, hereby solemnly affirm and declare that I am voluntarily filling and submitting the memorandum for marriage registration in order to register my marriage under the aforementioned Code.',
                  },
                  {
                    id: 'husbandMobileNumber',
                    name: 'Mobile Number (Linked with Aadhaar)',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandOtherNumber',
                    name: 'Alternate Mobile No',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandMailId',
                    name: 'Email ID',
                    type: 'text',
                    className: 'col-span-6',
                  },
                ],
              },
            ],
            validationSchema: z.object({}),
          },
        },
        husbandPresentAddress: {
          name: 'Present Address (Husband)',
          form: {
            subforms: [
              {
                id: 'husbandPresentAddress',
                name: 'Husband Present Address',
                fields: [
                  {
                    id: 'husbandState',
                    name: 'State',
                    type: 'select',
                    options: [
                      {
                        value: 'other',
                        name: 'Other',
                      },
                      {
                        value: 'uttarakhand',
                        name: 'Uttarakhand',
                      },
                    ],
                    className: 'col-span-6',
                    onChaneg(values, setValues) {
                      setValues('husbandPresentAddress.husbandUKDistrict', undefined)
                      setValues('husbandPresentAddress.husbandTehsil', undefined)
                      setValues('husbandPresentAddress.husbandArea', undefined)
                      setValues('husbandPresentAddress.husbandBlock', undefined)
                      setValues('husbandPresentAddress.husbandGramPanchayat', undefined)
                      setValues('husbandPresentAddress.husbandVillage', undefined)
                      setValues('husbandPresentAddress.husbandMunicipalArea', undefined)
                      setValues('husbandPresentAddress.husbandCantonmentBoard', undefined)
                      setValues('husbandPresentAddress.husbandUKPinCode', undefined)
                      setValues('husbandPresentAddress.husbandUKFullAddress', undefined)
                      setValues('husbandPresentAddress.husbandOtherDistrict', undefined)
                      setValues('husbandPresentAddress.husbandOtherPinCode', undefined)
                      setValues('husbandPresentAddress.husbandOtherFullAddress', undefined)
                    },
                  },
                  {
                    id: 'husbandUKDistrict',
                    name: 'District',
                    type: 'select',
                    options: [
                      {
                        value: 'demoDistrict',
                        name: 'Demo District',
                      },
                    ],
                    hidden: (values) => values.husbandPresentAddress?.husbandState !== 'uttarakhand',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandTehsil',
                    name: 'Tehsil',
                    type: 'select',
                    hidden: (values) => values.husbandPresentAddress?.husbandState !== 'uttarakhand',
                    options: [
                      {
                        value: 'demoTehsil',
                        name: 'Demo Tehsil',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandArea',
                    name: 'Area',
                    type: 'select',
                    hidden: (values) => values.husbandPresentAddress?.husbandState !== 'uttarakhand',
                    options: [
                      {
                        value: 'rural',
                        name: 'Rural',
                      },
                      {
                        value: 'urban',
                        name: 'Urban',
                      },
                      {
                        value: 'cantonment',
                        name: 'Cantonment Board',
                      },
                    ],
                    onChange(values, setValues) {
                      setValues('husbandPresentAddress.husbandCantonmentBoard', undefined)
                      setValues('husbandPresentAddress.husbandBlock', undefined)
                      setValues('husbandPresentAddress.husbandGramPanchayat', undefined)
                      setValues('husbandPresentAddress.husbandVillage', undefined)
                      setValues('husbandPresentAddress.husbandMunicipalArea', undefined)
                    },
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandBlock',
                    name: 'Block',
                    type: 'select',
                    hidden: (values) => values.husbandPresentAddress?.husbandArea !== 'rural',
                    options: [
                      {
                        value: 'demoBlock',
                        name: 'Demo Block',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandGramPanchayat',
                    name: 'Gram Panchayat',
                    hidden: (values) => values.husbandPresentAddress?.husbandArea !== 'rural',
                    type: 'select',
                    options: [
                      {
                        value: 'demoGramPanchayat',
                        name: 'Demo Gram Panchayat',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandVillage',
                    name: 'Village',
                    type: 'select',
                    hidden: (values) => values.husbandPresentAddress?.husbandArea !== 'rural',
                    options: [
                      {
                        value: 'demoVillage',
                        name: 'Demo Village',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandMunicipalArea',
                    name: 'Municipal Area',
                    type: 'select',
                    hidden: (values) => values.husbandPresentAddress?.husbandArea !== 'urban',
                    options: [
                      {
                        value: 'demoMunicipalArea',
                        name: 'Demo Municipal Area',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandCantonmentBoard',
                    name: 'Cantonment Board',
                    hidden: (values) => values.husbandPresentAddress?.husbandArea !== 'cantonment',
                    type: 'select',
                    options: [
                      {
                        value: 'demoCantonmentBoard',
                        name: 'Demo Cantonment Board',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandUKPinCode',
                    name: 'Pin Code',
                    type: 'text',
                    hidden: (values) => values.husbandPresentAddress?.husbandState !== 'uttarakhand',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandUKFullAddress',
                    name: 'Full Address',
                    hidden: (values) => values.husbandPresentAddress?.husbandState !== 'uttarakhand',
                    type: 'text',
                    className: 'col-span-full',
                  },
                  {
                    id: 'husbandOtherDistrict',
                    name: 'District',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandOtherPinCode',
                    name: 'Pin Code',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandOtherFullAddress',
                    name: 'Full Address',
                    type: 'text',
                    className: 'col-span-full',
                  },
                ],
              },
            ],
            validationSchema: z.object({}),
          },
        },
        husbandPermanentAddress: {
          name: 'Permanent Address (Husband)',
          form: {
            subforms: [
              {
                id: 'husbandPermanentAddress',
                name: 'Husband Permanent Address',
                fields: [
                  {
                    id: 'husbandPermanentAddressSameAsPresent',
                    label: 'Is Permanent Address same as Present Address?',
                    type: 'checkbox',
                    onChange(values, setValues) {
                      if (values.husbandPermanentAddress?.husbandPermanentAddressSameAsPresent) {
                        setValues(
                          'husbandPermanentAddress.husbandPermanentState',
                          values.husbandPresentAddress?.husbandState,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentUKDistrict',
                          values.husbandPresentAddress?.husbandUKDistrict,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentTehsil',
                          values.husbandPresentAddress?.husbandTehsil,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentArea',
                          values.husbandPresentAddress?.husbandArea,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentBlock',
                          values.husbandPresentAddress?.husbandBlock,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentGramPanchayat',
                          values.husbandPresentAddress?.husbandGramPanchayat,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentVillage',
                          values.husbandPresentAddress?.husbandVillage,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentMunicipalArea',
                          values.husbandPresentAddress?.husbandMunicipalArea,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentCantonmentBoard',
                          values.husbandPresentAddress?.husbandCantonmentBoard,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentUKPinCode',
                          values.husbandPresentAddress?.husbandUKPinCode,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentUKFullAddress',
                          values.husbandPresentAddress?.husbandUKFullAddress,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentOtherDistrict',
                          values.husbandPresentAddress?.husbandOtherDistrict,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentOtherPinCode',
                          values.husbandPresentAddress?.husbandOtherPinCode,
                        )
                        setValues(
                          'husbandPermanentAddress.husbandPermanentOtherFullAddress',
                          values.husbandPresentAddress?.husbandOtherFullAddress,
                        )
                      } else {
                        setValues('husbandPermanentAddress.husbandPermanentState', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentUKDistrict', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentTehsil', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentArea', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentBlock', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentGramPanchayat', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentV', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentMunicipalArea', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentCantonmentBoard', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentUKPinCode', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentUKFullAddress', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentOtherDistrict', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentOtherPinCode', undefined)
                        setValues('husbandPermanentAddress.husbandPermanentOtherFullAddress', undefined)
                      }
                    },
                  },
                  {
                    id: 'husbandPermanentState',
                    name: 'State',
                    type: 'select',
                    options: [
                      {
                        value: 'uttarakhand',
                        name: 'Uttarakhand',
                      },
                      {
                        value: 'other',
                        name: 'Other',
                      },
                    ],
                    onChange(values, setValues) {
                      setValues('husbandPermanentAddress.husbandPermanentUKDistrict', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentTehsil', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentArea', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentBlock', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentGramPanchayat', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentVillage', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentMunicipalArea', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentCantonmentBoard', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentUKPinCode', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentUKFullAddress', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentOtherDistrict', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentOtherPinCode', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentOtherFullAddress', undefined)
                    },
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentUKDistrict',
                    name: 'District',
                    type: 'select',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentState !== 'uttarakhand',
                    options: [
                      {
                        value: 'demoDistrict',
                        name: 'Demo District',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentTehsil',
                    name: 'Tehsil',
                    type: 'select',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentState !== 'uttarakhand',
                    options: [
                      {
                        value: 'demoTehsil',
                        name: 'Demo Tehsil',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentArea',
                    name: 'Area',
                    type: 'select',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentState !== 'uttarakhand',
                    options: [
                      {
                        value: 'rural',
                        name: 'Rural',
                      },
                      {
                        value: 'urban',
                        name: 'Urban',
                      },
                      {
                        value: 'cantonment',
                        name: 'Cantonment Board',
                      },
                    ],
                    onChaneg(values, setValues) {
                      setValues('husbandPermanentAddress.husbandPermanentCantonmentBoard', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentBlock', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentGramPanchayat', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentVillage', undefined)
                      setValues('husbandPermanentAddress.husbandPermanentMunicipalArea', undefined)
                    },
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentBlock',
                    name: 'Block',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentArea !== 'rural',
                    type: 'select',
                    options: [
                      {
                        value: 'demoBlock',
                        name: 'Demo Block',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentGramPanchayat',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentArea !== 'rural',
                    name: 'Gram Panchayat',
                    type: 'select',
                    options: [
                      {
                        value: 'demoGramPanchayat',
                        name: 'Demo Gram Panchayat',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentVillage',
                    name: 'Village',
                    type: 'select',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentArea !== 'rural',
                    options: [
                      {
                        value: 'demoVillage',
                        name: 'Demo Village',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentMunicipalArea',
                    name: 'Municipal Area',
                    type: 'select',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentArea !== 'urban',
                    options: [
                      {
                        value: 'demoMunicipalArea',
                        name: 'Demo Municipal Area',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentCantonmentBoard',
                    name: 'Cantonment Board',
                    type: 'select',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentArea !== 'cantonment',
                    options: [
                      {
                        value: 'demoCantonmentBoard',
                        name: 'Demo Cantonment Board',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentUKPinCode',
                    name: 'Pin Code',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentState !== 'uttarakhand',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentUKFullAddress',
                    name: 'Full Address',
                    type: 'text',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentState !== 'uttarakhand',
                    className: 'col-span-full',
                  },
                  {
                    id: 'husbandPermanentOtherDistrict',
                    name: 'District',
                    hidden: (values) => values.husbandPermanentAddress?.husbandPermanentState === 'uttarakhand',
                    type: 'select',
                    options: [
                      {
                        value: 'demoDistrict',
                        name: 'Demo District',
                      },
                    ],
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentOtherPinCode',
                    name: 'Pin Code',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'husbandPermanentOtherFullAddress',
                    name: 'Full Address',
                    type: 'text',
                    className: 'col-span-full',
                  },
                ],
              },
            ],
            validationSchema: z.object({}),
          },
        },
        marriageRegistrationDetails: {
          name: 'Marriage Registration Details',
          form: {
            subforms: [
              {
                id: 'marriageRegistrationDetails',
                name: 'Marriage Registration Details',
                fields: [
                  {
                    id: 'dateOfMarriage',
                    name: 'Date of Marriage',
                    type: 'date',
                    className: 'col-span-6',
                  },
                  {
                    id: 'marriageRegistrationNumber',
                    name: 'Marriage Registration Number',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'uploadMarriageRegistrationCertificate',
                    name: 'Upload Marriage Registration Certificate',
                    type: 'text',
                    className: 'col-span-6',
                  },
                  {
                    id: 'typeOfMarriageCeremony',
                    name: 'Type of Marriage Ceremony',
                    type: 'select',
                    options: [
                      {
                        value: '1',
                        name: 'Saptapadi',
                      },
                      {
                        value: '2',
                        name: 'Ashirvad',
                      },
                      {
                        value: '3',
                        name: 'Nikah',
                      },
                      {
                        value: '4',
                        name: 'Holy Union',
                      },
                      {
                        value: '5',
                        name: 'Anand Karaj',
                      },
                      {
                        value: '6',
                        name: 'Arya Samaji',
                      },
                      {
                        value: '7',
                        name: 'Others',
                      },
                    ],
                    onChange: (values, setValues) => {
                      setValues('marriageRegistrationDetails.otherNameCeremonyDetail', undefined)
                    },
                    className: 'col-span-6',
                  },
                  {
                    id: 'otherNameCeremonyDetail',
                    name: 'Specify Ceremony Detail',
                    type: 'text',
                    hidden: (values) => values.marriageRegistrationDetails?.typeOfMarriageCeremony !== '7',
                    className: 'col-span-6',
                  },
                ],
              },
            ],
            validationSchema: z.object({}),
          },
        },
        declaration: {
          name: 'Declaration',
          form: {
            subforms: [
              {
                id: 'declaration',
                name: 'Declaration',
                fields: [
                  {
                    id: 'declaration1',
                    type: 'checkbox',
                    label:
                      'We hereby declare and solemnly affirm that- Pursuant to section 7 (2) (a) of the Uniform Civil Code, Uttarakhand, 2024, a marriage ceremony has been performed by us and we have been living together as spouses ever since.',
                  },
                  {
                    id: 'declaration2',
                    type: 'checkbox',
                    label:
                      'The information given above and in the enclosed documents are true and the documents attached thereof are not forged or fabricated to the best of our knowledge and belief and no material fact has been withheld by us.',
                  },
                  {
                    id: 'declaration3',
                    type: 'checkbox',
                    label:
                      'We are well aware of the fact that if we intentionally provide false information or deliver forged or fabricated documents, we shall be liable under sub-section (2) of section 17 of the Uniform Civil Code, Uttarakhand, 2024.',
                  },
                ],
              },
            ],
            validationSchema: z.object({}),
          },
        },
      },
      stepOrder: [
        'registrationDetails',
        'wifeDetails',
        'wifePresentAddress',
        'wifePermanentAddress',
        'husbandDetails',
        'husbandPresentAddress',
        'husbandPermanentAddress',
        'marriageRegistrationDetails',
        'declaration',
      ],
    },
    onSubmit: (values) => {
      // eslint-disable-next-line no-console
      console.log(values)
    },
  },
}
