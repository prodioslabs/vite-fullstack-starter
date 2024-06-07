import { boolean, z } from 'zod'
import { option } from '../form'
import { client } from './client'

const formActionEnum = z.enum(['PUBLISH', 'UPDATE', 'CLARIFY', 'APPROVE', 'REJECT', 'NOTIFY', 'APPROVE_WITH_SIGN'])

export const form = z.object({
  id: z.string(),
  published: z.boolean(),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completed: z.boolean(),
  completedAt: z.date().nullable(),
  rejected: z.boolean(),
  rejectedAt: z.date().nullable(),
  applicationId: z.string().nullable(),
  registrationNumber: z.string().nullable(),
  formData: z.record(z.string(), z.any()),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  service: z.object({
    id: z.string(),
    slug: z.string(),
    nameEnglish: z.string(),
    nameHindi: z.string(),
    descriptionEnglish: z.string(),
    descriptionHindi: z.string(),
    code: z.string(),
    status: z.string(),
    charge: z.number(),
  }),
})

export const formContract = client.router(
  {
    getForm: {
      method: 'GET',
      path: '/:formId',
      pathParams: z.object({
        formId: z.string(),
      }),
      responses: {
        404: z.object({
          error: z.string(),
        }),
        403: z.object({
          error: z.string(),
        }),
        200: form.extend({
          actions: z.array(formActionEnum),
          steps: z.array(
            z.object({
              id: z.string(),
              level: z.number().int(),
              formId: z.string().nullable(),
              actions: z.array(formActionEnum),
              isActiveStep: z.boolean(),
              isLastStep: z.boolean(),
              status: z.enum(['AWAITING', 'APPROVED', 'DISAPPROVED']),
              fromId: z.string(),
              toId: z.string(),
              comment: z.string().optional().nullable(),
              rejectedReason: z.string().optional().nullable(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          ),
        }),
      },
    },
    getForms: {
      method: 'GET',
      path: '/',
      query: z.object({
        status: z.enum(['DRAFT', 'APPROVED', 'PENDING', 'REJECTED']).optional(),
      }),
      responses: {
        200: z.array(form),
        403: z.object({
          error: z.string(),
        }),
      },
    },
    createForm: {
      method: 'POST',
      path: '/',
      body: z.object({
        serviceSlug: z.string(),
      }),
      responses: {
        400: z.object({
          error: z.string(),
        }),
        201: form,
      },
    },
    updateForm: {
      method: 'PATCH',
      path: '/update/:formId',
      pathParams: z.object({
        formId: z.string(),
      }),
      body: z.object({
        formData: z.record(z.string(), z.any()),
        withValidation: z.boolean().optional(),
      }),
      responses: {
        404: z.object({
          error: z.string(),
        }),
        403: z.object({
          error: z.string(),
        }),
        200: form,
      },
    },
    publishForm: {
      method: 'PATCH',
      path: '/publish/:formId',
      pathParams: z.object({
        formId: z.string(),
      }),
      body: z.object({
        formData: z.record(z.string(), z.any()),
      }),
      responses: {
        404: z.object({
          error: z.string(),
        }),
        403: z.object({
          error: z.string(),
        }),
        200: form,
      },
    },
    approveForm: {
      method: 'POST',
      path: '/approve/:formId',
      pathParams: z.object({
        formId: z.string(),
      }),
      body: z.object({
        comment: z.string().optional(),
      }),
      responses: {
        404: z.object({
          error: z.string(),
        }),
        403: z.object({
          error: z.string(),
        }),
        200: form,
      },
    },
    rejectForm: {
      method: 'POST',
      path: '/reject/:formId',
      pathParams: z.object({
        formId: z.string(),
      }),
      body: z.object({
        comment: z.string().optional(),
        rejectReason: option.optional().nullable(),
      }),
      responses: {
        404: z.object({
          error: z.string(),
        }),
        403: z.object({
          error: z.string(),
        }),
        200: form,
      },
    },
    approveWithSignForm: {
      method: 'POST',
      path: '/approve-with-sign/:formId',
      pathParams: z.object({
        formId: z.string(),
      }),
      body: z.object({
        comment: z.string().optional(),
        signature: z.string(),
        publicKey: z.string(),
        subject: z.string(),
      }),
      responses: {
        404: z.object({
          error: z.string(),
        }),
        403: z.object({
          error: z.string(),
        }),
        200: form,
      },
    },
    getStats: {
      method: 'GET',
      path: '/stats',
      responses: {
        200: z.object({
          totalApplications: z.number(),
          totalApproved: z.number(),
          totalRejected: z.number(),
          totalPending: z.number(),
          pendingApplicationsByWeek: z.record(z.string(), z.number()),
        }),
        403: z.object({
          error: z.string(),
        }),
        404: z.object({
          error: z.string(),
        }),
      },
    },
    deleteForm: {
      method: 'DELETE',
      path: '/delete/:formId',
      pathParams: z.object({
        formId: z.string(),
      }),
      body: z.object({}),
      responses: {
        404: z.object({
          error: z.string(),
        }),
        403: z.object({
          error: z.string(),
        }),
        200: z.object({
          success: z.boolean(),
        }),
      },
    },
    bulkDeleteForms: {
      method: 'DELETE',
      path: '/delete',
      body: z.object({ formIds: z.array(z.string()) }),
      responses: {
        200: z.object({ success: boolean() }),
        403: z.object({ error: z.string() }),
        404: z.object({ error: z.string() }),
      },
    },
  },

  {
    pathPrefix: '/form',
  },
)
