package com.academic.util;

import java.io.*;

public class FileUtils {
    private FileUtils() {
        // Private constructor to prevent instantiation
    }

    @SuppressWarnings("unchecked")
    public static <T> T deserialize(String filePath, Class<T> clazz) throws IOException, ClassNotFoundException {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(filePath))) {
            Object obj = ois.readObject();
            if (clazz.isInstance(obj)) {
                return (T) obj;
            } else {
                throw new ClassCastException("Object in file is not of expected type: " + clazz.getName());
            }
        }
    }
}