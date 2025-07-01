public class ClientLauncher {
    public static void main(String[] args) throws Exception {
        // 启动第一个客户端
        Process p1 = Runtime.getRuntime().exec("java -cp src Client");

        // 等待一段时间再启动其他客户端
        Thread.sleep(1500);
    }
}