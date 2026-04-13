import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
    auth?: {
      userType: import('./auth.js').UserType;
      merchant?: {
        merchantUserId: string;
        merchantId: string;
        role: string;
        branchId: string | null;
      };
      staff?: {
        staffId: string;
        staffType: import('./auth.js').PlatformStaffType;
        roleId: string | null;
        permissions: string[];
      };
    };
  }
}
