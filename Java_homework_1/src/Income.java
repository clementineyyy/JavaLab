class Income {
    protected double income;
    public Income(double income) {
        this.income = income;
    }
    public double getTax() {
        return income * 0.1; // 税率10%
    }
}

class Salary extends Income {
    public Salary(double income) {
        super(income);
    }
    @Override
    public double getTax() {
        if (income <= 5000) {
            return 0;
        }
        return (income - 5000) * 0.2;
    }
}

class Bonus extends Income {
    public Bonus(double income) {
        super(income);
    }
    @Override
    public double getTax() {
        return income * 0.15;
    }
}