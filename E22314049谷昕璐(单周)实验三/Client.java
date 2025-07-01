import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.List;

public class Client extends JFrame {
    private static final String SERVER_IP = "localhost";
    private static final int SERVER_PORT = 8888;

    private String username;
    private Socket socket;
    private BufferedReader in;
    private PrintWriter out;

    private JList<String> friendList;
    private DefaultListModel<String> friendModel;
    private Map<String, ChatWindow> chatWindows;
    private Map<String, java.util.List<String>> chatHistories;

    public Client() {
        super("聊天客户端");

        // 登录窗口
        username = JOptionPane.showInputDialog(this, "请输入用户名:");
        if (username == null || username.trim().isEmpty()) {
            System.exit(0);
        }

        chatWindows = new HashMap<>();
        // 初始化聊天历史记录
        chatHistories = new HashMap<>();

        // 连接服务器
        try {
            connectToServer();
        } catch (IOException e) {
            JOptionPane.showMessageDialog(this, "无法连接到服务器: " + e.getMessage());
            System.exit(1);
        }

        // 设置UI
        setupUI();

        // 启动消息接收线程
        new Thread(new MessageReceiver()).start();

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(300, 500);
        setLocationRelativeTo(null);
        setVisible(true);
    }

    private void connectToServer() throws IOException {
        socket = new Socket(SERVER_IP, SERVER_PORT);
        in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        out = new PrintWriter(socket.getOutputStream(), true);

        // 发送用户名到服务器
        out.println(username);
    }

    private void setupUI() {
        setLayout(new BorderLayout());

        // 好友列表
        friendModel = new DefaultListModel<>();
        friendList = new JList<>(friendModel);
        JScrollPane scrollPane = new JScrollPane(friendList);
        add(scrollPane, BorderLayout.CENTER);

        // 好友列表双击事件
        friendList.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getClickCount() == 2) {
                    String friend = friendList.getSelectedValue();
                    if (friend != null && !friend.equals(username)) {
                        openChatWindow(friend);
                    }
                }
            }
        });

        // 添加标题
        JLabel titleLabel = new JLabel("好友列表", JLabel.CENTER);
        titleLabel.setFont(new Font("宋体", Font.BOLD, 16));
        add(titleLabel, BorderLayout.NORTH);

        // 状态栏
        JLabel statusLabel = new JLabel("当前用户: " + username);
        add(statusLabel, BorderLayout.SOUTH);
    }

    private void openChatWindow(String friend) {
        if (!chatWindows.containsKey(friend)) {
            if (!chatHistories.containsKey(friend)) {
                chatHistories.put(friend, new ArrayList<>());
            }
            ChatWindow chatWindow = new ChatWindow(friend, chatHistories.get(friend));
            chatWindows.put(friend, chatWindow);
            chatWindow.setVisible(true);
        } else {
            chatWindows.get(friend).toFront();
        }
    }

    public void saveMessageToHistory(String friend, String sender, String message) {
        if (!chatHistories.containsKey(friend)) {
            chatHistories.put(friend, new ArrayList<>());
        }
        chatHistories.get(friend).add(sender + ": " + message);
    }


    public void sendPrivateMessage(String recipient, String message) {
        out.println("PRIVATE:" + recipient + ":" + message);
        saveMessageToHistory(recipient, username, message);
    }

    // 消息接收线程
    private class MessageReceiver implements Runnable {
        @Override
        public void run() {
            try {
                String message;
                while ((message = in.readLine()) != null) {
                    processMessage(message);
                }
            } catch (IOException e) {
                JOptionPane.showMessageDialog(Client.this, "与服务器的连接已断开。");
                System.exit(1);
            }
        }

        private void processMessage(String message) {
            if (message.startsWith("ONLINE:")) {
                // 更新在线用户列表
                updateOnlineUsers(message.substring(7));
            } else if (message.startsWith("MSG:")) {
                // 处理私人消息: MSG:sender:message
                String[] parts = message.split(":", 3);
                if (parts.length == 3) {
                    String sender = parts[1];
                    String content = parts[2];
                    receiveMessage(sender, content);
                }
            }
        }

        private void updateOnlineUsers(String userList) {
            String[] users = userList.split(",");
            SwingUtilities.invokeLater(() -> {
                friendModel.clear();
                for (String user : users) {
                    if (!user.equals(username)) {
                        friendModel.addElement(user);
                    }
                }
            });
        }

        private void receiveMessage(String sender, String content) {
            SwingUtilities.invokeLater(() -> {
                saveMessageToHistory(sender, sender, content);
                if (!chatWindows.containsKey(sender)) {
                    openChatWindow(sender);
                } else {
                    chatWindows.get(sender).displayMessage(sender, content);
                }
            });
        }
    }


    private class ChatWindow extends JFrame {
        private String friend;
        private JTextArea chatArea;
        private JTextField messageField;
        private java.util.List<String> chatHistory;

        public ChatWindow(String friend, java.util.List<String> history) {
            super("Chat with " + friend);
            this.friend = friend;
            this.chatHistory = history;

            setLayout(new BorderLayout());
            chatArea = new JTextArea();
            chatArea.setEditable(false);
            JScrollPane scrollPane = new JScrollPane(chatArea);
            add(scrollPane, BorderLayout.CENTER);

            loadChatHistory();

            JPanel inputPanel = new JPanel(new BorderLayout());
            messageField = new JTextField();
            JButton sendButton = new JButton("Send");

            inputPanel.add(messageField, BorderLayout.CENTER);
            inputPanel.add(sendButton, BorderLayout.EAST);
            add(inputPanel, BorderLayout.SOUTH);

            ActionListener sendAction = e -> {
                String message = messageField.getText();
                if (!message.trim().isEmpty()) {
                    sendPrivateMessage(friend, message);
                    displayMessage(username, message);
                    messageField.setText("");
                }
            };

            sendButton.addActionListener(sendAction);
            messageField.addActionListener(sendAction);

            setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
            setSize(400, 300);
            setLocationRelativeTo(null);

            addWindowListener(new WindowAdapter() {
                @Override
                public void windowClosing(WindowEvent e) {
                    chatWindows.remove(friend);
                    dispose();
                }
            });
        }

        private void loadChatHistory() {
            for (String message : chatHistory) {
                chatArea.append(message + "\n");
            }
            chatArea.setCaretPosition(chatArea.getDocument().getLength());
        }

        public void displayMessage(String sender, String message) {
            chatArea.append(sender + ": " + message + "\n");
            chatArea.setCaretPosition(chatArea.getDocument().getLength());
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Client());
    }
}