import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class ZooManagementSystem {
    public static void main(String[] args) {
        try {
            //创建不同动物对象
            Lion lion = new Lion("Simba", 5, LocalDate.of(2018, 1, 1), LocalDate.of(2016, 1, 1), "Golden");
            Penguin penguin = new Penguin("Pingu", 2, LocalDate.of(2021, 6, 15), LocalDate.of(2019, 6, 15),0.5);
            Wolf invalidWolf = new Wolf("InvalidWolf", 0, LocalDate.of(2023, 1, 1), LocalDate.of(2023, 1, 1), "Silver"); // 年龄为0的动物

            ZooUtils.checkAge(lion.getAge());
            ZooUtils.checkAge(penguin.getAge());
            //需要查看异常处理流程可取消下一行的注释
            //ZooUtils.checkAge(invalidWolf.getAge()); // 这行会引发 InvalidAgeException,

            //实现多态调用makeSound()
            System.out.println("Animal sounds:");
            lion.makeSound();
            penguin.makeSound();

            //使用List集合类进行数据管理,用于存储和操作一组对象的类
            List<Animal> animals = new ArrayList<>();
            animals.add(lion);
            animals.add(penguin);

            System.out.println("Now display adult animals:");
            ZooUtils.displayAdultAnimals(animals);
            //展示集合排序功能
            ZooUtils.sortAnimalsByAdmissionDate(animals);

            ZooKeeper zooKeeper = new ZooKeeper("John Doe");
            zooKeeper.addAnimal(lion);
            zooKeeper.addAnimal(penguin);

            // 实现接口定义的feedAnimal方法
            System.out.println("Feeding animals:");
            for (Animal animal : animals) {
                zooKeeper.feedAnimal(animal);
            }

            //计算某饲养员照顾动物的平均年龄
            double averageAge = ZooUtils.calculateAverageAge(zooKeeper.getAnimals());
            System.out.println("Average age of animals: " + averageAge);

            //展示日期计算功能：计算并展示每个动物从入园到现在的时长
            for (Animal animal : animals) {
                long careDays = zooKeeper.calculateCareDays(animal);
                System.out.println(animal.getName() + " has been in the zoo for " + careDays + " days.");
            }

            //展示日期计算功能: 计算并展示每个动物的实际年龄
            System.out.println("Animal real ages according to birthDate:");
            for (Animal animal : animals) {
                int age = ZooUtils.calculateAge(animal.getBirthDate());
                System.out.println(animal.getName() + " is " + age + " years old.");
            }
        } catch (InvalidAgeException e) {
            System.out.println(e.getMessage());
        }
    }
}