export const permissionCheck = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
