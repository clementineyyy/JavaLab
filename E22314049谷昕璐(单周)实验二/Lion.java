import java.time.LocalDate;

public class Lion extends Mammal {
    public Lion(String name, int age, LocalDate admissionDate, LocalDate birthDate, String furColor) {
        super(name, age, admissionDate, birthDate, furColor);
    }

    @Override
    public void makeSound() {
        System.out.println("Roar");
    }
}