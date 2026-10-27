import { Notification } from '../models/Notification.js'

export const createNotification = async ({
  organization,
  user,
  type = 'system',
  title,
  message,
  link = '',
  dedupeKey,
}) => {
  if (!organization || !user) return null

  if (dedupeKey) {
    return Notification.findOneAndUpdate(
      { organization, user, dedupeKey },
      {
        $setOnInsert: {
          organization,
          user,
          type,
          title,
          message,
          link,
          dedupeKey,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }

  return Notification.create({
    organization,
    user,
    type,
    title,
    message,
    link,
  })
}

export const notifyMany = async (userIds, payload) => {
  await Promise.all(
    [...new Set(userIds.map(String))].map((userId) =>
      createNotification({ ...payload, user: userId }),
    ),
  )
}
