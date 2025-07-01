abstract class Abstract_Income {
    protected double income;

    public Abstract_Income(double income) {
        this.income = income;
    }

    public abstract double getTax();
}

class SalaryTwo extends Abstract_Income {
    public SalaryTwo(double income) {
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

class BonusTwo extends Abstract_Income {
    public BonusTwo(double income) {
        super(income);
    }

    @Override
    public double getTax() {
        return income * 0.15;
    }
}
