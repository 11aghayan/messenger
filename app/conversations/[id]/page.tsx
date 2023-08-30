import getConversationById from "@/app/actions/getConversationById"
import getMessages from "@/app/actions/getMessages"
import EmptyState from "@/app/components/EmptyState"

import Header from "./components/Header"
import Body from "./components/Body"
import Form from "./components/Form"


type ParamsType = {
  params: {
    id: string
  }
}

const ConversationId = async ({ params: { id } }: ParamsType) => {

  const conversation = await getConversationById(id);
  const messages = await getMessages(id);
  
  return (
    <div className="lg:pl-80 h-full">
      <div className="h-full flex flex-col">
        {
          !conversation 
            ? 
            <EmptyState /> 
            : (
            <>
              <Header conversation={conversation} />
              <Body initialMessages={messages} />
              <Form />
            </>
          )
        }
      </div>
    </div>
  )
}

export default ConversationId;