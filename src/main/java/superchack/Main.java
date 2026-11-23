package superchack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {
    static void main() {
        SpringApplication.run(Main.class);
        System.out.print("Сайт:http://localhost:8080");
    }
}