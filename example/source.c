#include <stdio.h>

namespace test
{
	struct mystruct
	{
		int a;
		int b;
	};
	
	int thisa;
	
	namespace nested_test
	{
		struct test::mystruct add(int a, int b)
		{
			return (struct test::mystruct) { .a = a, .b = test::thisa };
		}
		
		struct test::mystruct (*testfunc(void))(int, int)
		{
			return test::nested_test::add;
		}
		
		void printa(struct test::mystruct mystr)
		{
			const char *str = "%d\n";
			int x = 5;
			printf(str, mystr.a);
		}
	}
	
	int zero()
	{
		return 0;
	}
}

int main()
{
	test::thisa = 7;
	test::nested_test::printa(test::nested_test::testfunc()(5, 6));
	printf("%d\n", test::nested_test::testfunc()(5, 6).b);
	return test::zero();
}
