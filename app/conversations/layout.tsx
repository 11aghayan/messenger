import Sidebar from "@/app/components/sidebar/Sidebar";
import getConversations from "@/app/actions/getConversations";
import getUsers from "@/app/actions/getUsers";

import ConversationList from "./components/ConversationList";

interface Props {
  children: React.ReactNode
}

export default async function layout({ children }: Props) {

  const conversations = await getConversations();
  const users = await getUsers();
  
  return (
    <Sidebar>
      <div className="h-full">
        <ConversationList 
          users={users}
          initialItems={conversations} 
        />
        {children}
      </div>
    </Sidebar>
  )
}