import java.time.LocalDate;

public abstract class Animal {
    private String name;
    private int age;
    private LocalDate admissionDate;
    private LocalDate birthDate;

    public Animal(String name, int age, LocalDate admissionDate, LocalDate birthDate) {
        this.name = name;
        this.age = age;
        this.admissionDate = admissionDate;
        this.birthDate = birthDate;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public LocalDate getAdmissionDate() {
        return admissionDate;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public abstract void makeSound();
}