import { main } from '../lib/commitmatic';

console.log(process.argv);

main().catch((e) => {
  console.log(e);
});
