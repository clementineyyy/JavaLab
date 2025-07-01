public class Main_Income_Two {
        public static void main(String[] args) {
            Abstract_Income[] incomes = new Abstract_Income[] {
                    //抽象类无法实例化
                    new SalaryTwo(7500),
                    new BonusTwo(15000)
            };
            System.out.println(totalTax(incomes));
        }

        public static double totalTax(Abstract_Income[] incomes) {
            double total = 0;
            for (Abstract_Income income : incomes) {
                total += income.getTax();
            }
            return total;
        }
}
