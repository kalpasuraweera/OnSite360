export type Permission = {
  page_id: string;
  page_name: string;
  level: string;
  components: {
    component_id: string;
    component_name: string;
    level: string;
  }[];
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Add any other user properties you need
}
