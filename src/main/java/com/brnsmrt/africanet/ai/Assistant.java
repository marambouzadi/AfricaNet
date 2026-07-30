package com.brnsmrt.africanet.ai;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.TokenStream;
import dev.langchain4j.service.UserMessage;

import java.util.UUID;


public interface Assistant {

	@SystemMessage(fromResource = "/prompt/system.st")
	TokenStream chat(@MemoryId UUID memoryId, @UserMessage String userMessage);

}
