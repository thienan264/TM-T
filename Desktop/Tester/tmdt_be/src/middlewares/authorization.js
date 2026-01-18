// Chỉ cho ADMIN
export function requireAdmin(req, res, next) {
    try {
        if (!req.user?.role?.name || req.user.role.name !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Chỉ ADMIN được phép truy cập" });
        }
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: "Kiểm tra quyền thất bại" });
    }
}

// Chỉ cho USER
export function requireUser(req, res, next) {
    try {
        if (!req.user?.role?.name || req.user.role.name !== "USER") {
            return res.status(403).json({ success: false, message: "Chỉ USER được phép truy cập" });
        }
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: "Kiểm tra quyền thất bại" });
    }
}

// ADMIN hoặc USER đều được (chỉ cần đã đăng nhập)
export function requireAuthenticated(req, res, next) {
  try {
    if (!req.user?.role?.name || !["ADMIN", "USER"].includes(req.user.role.name)) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Kiểm tra quyền thất bại" });
  }
}

// Cho phép động theo danh sách vai trò, ví dụ authorizeRoles("admin")
export function authorizeRoles(...roles) {
  const allowed = roles.map(r => String(r).toUpperCase());
  return (req, res, next) => {
    try {
      const roleName = req.user?.role?.name?.toUpperCase();
      if (!roleName || !allowed.includes(roleName)) {
        return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
      }
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: "Kiểm tra quyền thất bại" });
    }
  };
}
