import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

public class ZooUtils {
    //工具类是包含静态方法的类，这些方法通常是通用的，可以在应用程序的不同部分中使用。不需要实例化
    public static int calculateAge(LocalDate birthDate) {
        //使用ChronoUnit根据出生日期计算实际年龄
        return (int) ChronoUnit.YEARS.between(birthDate, LocalDate.now());
    }

    //添加新动物时检查年龄合法性（年龄>0）
    public static void checkAge(int age) throws InvalidAgeException {
        if (age <= 0) {
            throw new InvalidAgeException("Age must be greater than 0");
        }
    }

    //显示所有成年动物（年龄>=3岁）
    public static void displayAdultAnimals(List<Animal> animals) {
        animals.stream()
                .filter(animal -> animal.getAge() >= 3)
                .forEach(animal -> System.out.println(animal.getName()));
    }

    //按入住日期排序动物列表
    public static void sortAnimalsByAdmissionDate(List<Animal> animals) {
        animals.sort((a1, a2) -> a1.getAdmissionDate().compareTo(a2.getAdmissionDate()));
        System.out.println("Animals sorted by admission date:");
        animals.forEach(animal -> System.out.println(animal.getName() + " - " + animal.getAdmissionDate()));
    }

    //计算某饲养员照顾动物的平均年龄
    public static double calculateAverageAge(List<Animal> animals) {
        return animals.stream()
                .mapToInt(Animal::getAge)
                .average()
                .orElse(0);
    }
}