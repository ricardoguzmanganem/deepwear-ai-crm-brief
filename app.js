const fmtE=n=>'€'+Math.round(n).toLocaleString('en-US');
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const peopleLabel=n=>n===1?'1 person':fmtN(n)+' people';

const staff=document.getElementById('staff');
const salary=document.getElementById('salary');
const routinePct=document.getElementById('routinePct');
const comms=document.getElementById('comms');

const hubCurrentSpend=document.getElementById('hubCurrentSpend');
const hubSeats=document.getElementById('hubSeats');
const hubIncludedCredits=document.getElementById('hubIncludedCredits');
const hubCreditPrice=document.getElementById('hubCreditPrice');
const hubAddonCost=document.getElementById('hubAddonCost');
const hubImplementation=document.getElementById('hubImplementation');
const hubMonths=document.getElementById('hubMonths');

const wfCreditsPerComm=document.getElementById('wfCreditsPerComm');
const assistCreditsPerComm=document.getElementById('assistCreditsPerComm');
const selectiveCreditsPerComm=document.getElementById('selectiveCreditsPerComm');

const scenarios=[
 {key:'wf',reduction:.30,creditsInput:wfCreditsPerComm},
 {key:'assist',reduction:.55,creditsInput:assistCreditsPerComm},
 {key:'selective',reduction:.75,creditsInput:selectiveCreditsPerComm}
];

function calc(sc){
 const payroll=Number(staff.value)*Number(salary.value);
 const routine=payroll*(Number(routinePct.value)/100);
 const released=routine*sc.reduction;
 const n=Math.max(0,Number(comms.value)||0);
 const required=n*Math.max(0,Number(sc.creditsInput.value)||0);
 const included=Math.max(0,Number(hubIncludedCredits.value)||0);
 const extra=Math.max(0,required-included);
 const price=Math.max(0,Number(hubCreditPrice.value)||0);
 const addons=Math.max(0,Number(hubAddonCost.value)||0);
 const cost=extra*price+addons;
 const net=released-cost;
 const months=Math.max(1,Number(hubMonths.value)||1);
 const implementation=Math.max(0,Number(hubImplementation.value)||0);
 const periodNet=(net*months)-implementation;
 return {payroll,routine,released,required,extra,cost,net,periodNet};
}

function updateBars(results){
 const max=Math.max(...results.flatMap(r=>[r.released,r.cost,Math.max(0,r.net)]),1);
 const baseY=270, maxH=190;
 const ids=['wf','assist','selective'];
 ids.forEach((id,i)=>{
 const r=results[i];
 const vals={Released:r.released,Cost:r.cost,Net:Math.max(0,r.net)};
 ['Released','Cost','Net'].forEach(kind=>{
 const el=document.getElementById(id+kind+'Bar');
 const h=maxH*(vals[kind]/max);
 el.setAttribute('y',baseY-h);
 el.setAttribute('height',h);
 });
 });
}

function updateAll(){
 const s=Number(staff.value);
 const sal=Number(salary.value);
 const rp=Number(routinePct.value)/100;
 const payroll=s*sal;
 const routine=payroll*rp;

 document.getElementById('staffLabel').textContent=s;
 document.getElementById('salaryLabel').textContent=fmtE(sal);
 document.getElementById('routineLabel').textContent=Math.round(rp*100)+'%';
 document.getElementById('commLabel').textContent=fmtN(comms.value);

 document.getElementById('payrollOut').textContent=fmtE(payroll);
 document.getElementById('routineOut').textContent=fmtE(routine);
 document.getElementById('annualRoutineOut').textContent=fmtE(routine*12);

 document.getElementById('payrollLegend').textContent=peopleLabel(s)+' × '+fmtE(sal);
 document.getElementById('routineLegend').textContent=Math.round(rp*100)+'% of '+fmtE(payroll)+' monthly payroll';
 document.getElementById('annualRoutineLegend').textContent='12 × '+fmtE(routine)+' monthly routine capacity';

 const results=scenarios.map(calc);

 document.getElementById('wfNet').textContent=fmtE(results[0].net);
 document.getElementById('assistNet').textContent=fmtE(results[1].net);
 document.getElementById('selectiveNet').textContent=fmtE(results[2].net);

 document.getElementById('wfNetLegend').textContent='30% removed • '+fmtE(results[0].cost)+' new monthly cost';
 document.getElementById('assistNetLegend').textContent='55% removed • '+fmtE(results[1].cost)+' new monthly cost';
 document.getElementById('selectiveNetLegend').textContent='75% removed • '+fmtE(results[2].cost)+' new monthly cost';

 ['wf','assist','selective'].forEach((id,i)=>{
 document.getElementById(id+'Net').style.color=results[i].net>=0?'#98f385':'#ff9db0';
 });

 updateBars(results);

 const currentSpend=Math.max(0,Number(hubCurrentSpend.value)||0);
 const seats=Math.max(0,Number(hubSeats.value)||0);
 const included=Math.max(0,Number(hubIncludedCredits.value)||0);
 const months=Math.max(1,Number(hubMonths.value)||1);
 const impl=Math.max(0,Number(hubImplementation.value)||0);

 document.getElementById('currentHubSpendOut').textContent=fmtE(currentSpend);
 document.getElementById('includedCreditsOut').textContent=fmtN(included);
 document.getElementById('periodOut').textContent=months+' mo';
 document.getElementById('currentHubSpendLegend').textContent=peopleLabel(seats)+' paid seats • sunk monthly cost';
 document.getElementById('includedCreditsLegend').textContent=fmtN(included)+' credits before incremental cost';
 document.getElementById('periodLegend').textContent=fmtE(impl)+' one-time implementation';

 const scenarioIds=['wf','assist','selective'];
 scenarioIds.forEach((id,i)=>{
   const r=results[i];
   document.getElementById(id+'CreditsRequiredOut').textContent=fmtN(r.required);
   document.getElementById(id+'ExtraCreditsOut').textContent=fmtN(r.extra);
   document.getElementById(id+'MonthlyCostOut').textContent=fmtE(r.cost);
   document.getElementById(id+'MonthlyNetOut').textContent=fmtE(r.net);
   document.getElementById(id+'PeriodLabel').textContent='Net over '+months+' month'+(months===1?'':'s');
   document.getElementById(id+'PeriodNetOut').textContent=fmtE(r.periodNet);
   document.getElementById(id+'PeriodNetOut').style.color=r.periodNet>=0?'#4de0bf':'#ff9db0';
 });
}

[
 staff,salary,routinePct,comms,
 hubCurrentSpend,hubSeats,hubIncludedCredits,hubCreditPrice,hubAddonCost,hubImplementation,hubMonths,
 wfCreditsPerComm,assistCreditsPerComm,selectiveCreditsPerComm
].forEach(el=>el.addEventListener('input',updateAll));

updateAll();

(function loadOperatingModel(){
  const img=document.getElementById('operatingModelImage');
  if(img) img.src='operating-model.svg';
})();
