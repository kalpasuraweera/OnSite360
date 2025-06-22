export type PermissionComponent = {
  componentId: string;
  componentName: string;
};

export type Permission = {
  id: string;
  level: number;
  permission: {
    pageId: string;
    pageName: string;
    components: {
      create: PermissionComponent[];
    };
  };
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    rolePermissions: Permission[];
    id: string;
    name: string;
  };
}
