export const permissionCheck = (requiredPermission) => {
  return (req, res, next) => {
    console.log("permissiondata", req.user);

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
