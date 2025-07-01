import java.time.LocalDate;

public class Panda extends Mammal {
    public Panda(String name, int age, LocalDate admissionDate, LocalDate birthDate, String furColor) {
        super(name, age, admissionDate, birthDate, furColor);
    }

    @Override
    public void makeSound() {
        System.out.println("Growl");
    }
}