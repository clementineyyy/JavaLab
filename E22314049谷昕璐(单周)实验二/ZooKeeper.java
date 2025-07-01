import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;


public class ZooKeeper implements Careable{
    private String id;
    private String name;
    //组合：允许一个类包含另一个类的实例，从而实现类之间的关系
    //组合的实现体现在 ZooKeeper 类包含了一个 List<Animal> 类型的成员变量 animals
    //ArrayList 是 Java 中常用的集合类之一，用于动态地存储和管理对象
    //animals 是一个 List<Animal> 类型的成员变量，用于存储该饲养员负责的动物列表
    private List<Animal> animals;

    public ZooKeeper(String name) {
        //自动生成唯一的员工ID
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.animals = new ArrayList<>();
    }

    public List<Animal> getAnimals() {
        return animals;
    }

    public void addAnimal(Animal animal) {
        animals.add(animal);
    }

    //实现接口
    @Override
    public void feedAnimal(Animal animal) {
        System.out.println("Feeding " + animal.getName());
    }

    @Override
    public long calculateCareDays(Animal animal) {
        return ChronoUnit.DAYS.between(animal.getAdmissionDate(), LocalDate.now());
    }
}