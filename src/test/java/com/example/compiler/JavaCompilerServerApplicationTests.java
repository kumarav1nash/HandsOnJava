package com.example.compiler;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "spring.flyway.enabled=false",
    "storage.type=memory"
})
class JavaCompilerServerApplicationTests {

	@Test
	void contextLoads() {
	}

}
