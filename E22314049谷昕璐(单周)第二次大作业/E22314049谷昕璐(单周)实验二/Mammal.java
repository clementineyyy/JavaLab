import java.time.LocalDate;

public abstract class Mammal extends Animal {
    private String furColor;

    public Mammal(String name, int age, LocalDate admissionDate, LocalDate birthDate, String furColor) {
        super(name, age, admissionDate, birthDate);
        this.furColor = furColor;
    }
}
