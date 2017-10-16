it(
  'make sure reply messages are not lost during parsing',
  urlParsing(
    driver,
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,r'
  )
);

it(
  'make sure async messages are not lost during parsing',
  urlParsing(
    driver,
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,a'
  )
);

it(
  'make sure async replies are not lost during parsing',
  urlParsing(
    driver,
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,ra'
  )
);

it(
  'make sure extra chars are discarted',
  urlParsing(
    driver,
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,grad',
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,ra'
  )
);

it('toggle arrow style', async () => {
  await goTo('o1,An%20Object;o2,Another%20Object;m1,o1,o2,message()');
  await toggleArrowStyle(driver, 'm1');
  await assertFragment(
    'o1,An%20Object;o2,Another%20Object;m1,o1,o2,message(),a'
  );
  await toggleArrowStyle(driver, 'm1');
  return assertFragment(
    'o1,An%20Object;o2,Another%20Object;m1,o1,o2,message()'
  );
});

it('toggle line style', async () => {
  await goTo('o1,An%20Object;o2,Another%20Object;m333,o1,o2,message()');
  await toggleLineStyle(driver, 'm333');
  await assertFragment(
    'o1,An%20Object;o2,Another%20Object;m333,o1,o2,message(),r'
  );
  await toggleLineStyle(driver, 'm333');
  return assertFragment(
    'o1,An%20Object;o2,Another%20Object;m333,o1,o2,message()'
  );
});
