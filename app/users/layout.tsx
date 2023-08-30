import Sidebar from "@/app/components/sidebar/Sidebar";
import getUsers from "@/app/actions/getUsers";

import UserList from "./components/UserList";

interface Props {
  children: React.ReactNode;
}

const UsersLayout = async ({ children }: Props) => {
  const users = await getUsers();
  
  return (
    <Sidebar>
      <section className="h-full">
        <UserList users={users} />
        {children}
      </section>
    </Sidebar>
  )
}

export default UsersLayout