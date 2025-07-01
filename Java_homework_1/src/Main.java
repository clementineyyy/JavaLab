public class Main {
    public static void main(String[] args){
        Person p = new Person("小明", 12);
        Student s = new Student("小红", 20, 99);
        // TOD0:定义PrimaryStudent，从student继承，新增grade字段:
        Student ps = new PrimaryStudent("小军", 9, 100, 5);
        System.out.println(ps.getScore());
    }
}