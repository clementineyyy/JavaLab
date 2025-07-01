import java.time.LocalDate;

public abstract class Bird extends Animal {
    private double wingspan;

    public Bird(String name, int age, LocalDate admissionDate, LocalDate birthDate, double wingspan) {
        super(name, age, admissionDate, birthDate);
        this.wingspan = wingspan;
    }
}