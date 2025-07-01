import java.time.LocalDate;

public class Flamingo extends Bird {
    public Flamingo(String name, int age, LocalDate admissionDate, LocalDate birthDate, double wingspan) {
        super(name, age, admissionDate, birthDate, wingspan);
    }

    @Override
    public void makeSound() {
        System.out.println("Honk");
    }
}