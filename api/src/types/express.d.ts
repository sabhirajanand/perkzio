import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
    auth?: {
      userType: import('./auth.js').UserType;
      staff?: {
        staffId: string;
        staffType: import('./auth.js').PlatformStaffType;
        roleId: string | null;
        permissions: string[];
      };
    };
  }
}
