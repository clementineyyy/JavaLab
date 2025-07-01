public interface Careable {
    //在接口中，只需要声明函数名和参数类型，而不需要定义具体的实现代码
    //在实现该接口的类中，需要提供这两个方法的具体实现
    void feedAnimal(Animal animal);
    long calculateCareDays(Animal animal);
}
