package com.brnsmrt.africanet.ai;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.TokenStream;
import dev.langchain4j.service.UserMessage;

import java.util.UUID;

// @AiService removed - bean is now built manually in AssistantConfiguration
// so we can explicitly register tools
public interface ChatbotService {

	@SystemMessage(fromResource = "/prompt/system.st")
	TokenStream chat(@MemoryId String memoryId, @UserMessage String userMessage);

}
