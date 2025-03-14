const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Obtenir toutes les notifications de l'utilisateur connecté
 */
exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Compter le nombre total de notifications
  const total = await Notification.countDocuments({ user: userId });
  
  // Récupérer les notifications paginées
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Compter les notifications non lues
  const unreadCount = await Notification.countDocuments({ 
    user: userId,
    read: false 
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    unreadCount,
    data: notifications
  });
});

/**
 * Marquer une notification comme lue
 */
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notificationId = req.params.id;
  const userId = req.user._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    return next(new AppError('Notification non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: notification
  });
});

/**
 * Marquer toutes les notifications comme lues
 */
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const result = await Notification.updateMany(
    { user: userId, read: false },
    { read: true }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.nModified} notifications marquées comme lues`
  });
});

/**
 * Créer une nouvelle notification
 * (usage interne uniquement, pas exposé comme API)
 */
exports.createNotification = async (user, title, message, type, referenceId = null, referenceModel = null) => {
  try {
    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      referenceId,
      referenceModel,
      read: false
    });

    return notification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return null;
  }
};

/**
 * Supprimer une notification
 */
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notificationId = req.params.id;
  const userId = req.user._id;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId
  });

  if (!notification) {
    return next(new AppError('Notification non trouvée', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Supprimer toutes les notifications lues
 */
exports.deleteReadNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const result = await Notification.deleteMany({
    user: userId,
    read: true
  });

  res.status(200).json({
    status: 'success',
    message: `${result.deletedCount} notifications supprimées`
  });
});