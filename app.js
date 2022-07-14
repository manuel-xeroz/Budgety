var budgetController = (function(){
   
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcpercentage = function(totalIncome){
        if (totalIncome > 0 ){
            this.percentage = Math.round((this.value / totalIncome) * 100) ;  
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;  
    };
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
        sum += cur.value; 
        });
        data.totals[type] = sum;
    };
            
    
    var data = {
        allItems: {
        exp: [],
        inc: []
    },
        totals: {
        exp: 0,
        inc: 0,
    },
        budget: 0,
        percentage: -1
    };
    
    
    
    return {
        addItem : function(type,des,val){
            var newItem,ID;
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp'){
                newItem = new Expense(ID,des,val);
            } else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');
            
            data.budget = data.totals.inc - data.totals.exp;
            
            if (data.totals.inc > 0){
                
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentage: function(){
           
            data.allItems.exp.forEach(function(cur){
               cur.calcpercentage(data.totals.inc); 
            });
        },
        
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp:data.totals.exp,
                percentage: data.percentage
            };
        },
        
        deleteItem: function(type, id){
            var ids, index;  
            
            ids = data.allItems[type].map(function(current){
                    return current.id; 
            });
            
            index = ids.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
         testing: function (){
         console.log(data);
    }
    };
    
})();

function xr(string){
    return document.querySelector(string);
}

var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
      var numSplit, int, dec, type;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        //2310.45 , 23,000
        if (int.length > 3 ) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        
        dec = numSplit[1];
        var sign;
        if(type === ''){
            sign = '';
        } else if (type === 'exp'){
            sign = '-';
        } else {
            sign = '+';
        }
        return sign + ' ' + int + '.' + dec ;
    };
    
        var nodeListForEach = function(list, callback){
                for ( var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
        
    return {
        getInput : function(){
        return {
            type: xr(DOMstrings.inputType).value,
            description:xr(DOMstrings.addDescription).value,
            value: parseFloat(xr(DOMstrings.addValue).value)
    };
    },
        addListItem : function(obj, type){
               var html, newHtml, element;
                if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                    
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){  
                element = DOMstrings.expensesContainer;
                
                 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%des%', obj.description);
            newHtml = newHtml.replace('%val%', formatNumber(obj.value, type));
            
            
            xr(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields : function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.addDescription +' ,'+ DOMstrings.addValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = '';
                fieldsArr[0].focus();
           
        });
            
            
             
            
            
        },
        
         displayBudget: function(obj){
             var type;
             if (obj.budget === 0) {
                 type = '';
             } else if (obj.budget > 0) {
                 type = 'inc';
                 document.querySelector(DOMstrings.budgetLabel).classList.remove('minus');
             } else {
                 type = 'exp';
                 document.querySelector(DOMstrings.budgetLabel).classList.toggle('minus');
             }
             
             
             xr(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
             xr(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
             xr(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
             
             if(obj.percentage > 0){
                xr(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
             } else {
                xr(DOMstrings.percentageLabel).textContent = '---';
             }
         },
        
        
         displayPercentage: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);  
             
            
            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
                
            });
            
             
         },
        
        
        displayMonth: function(){
            var now, months, month, year;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 
                     'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
                
        },
        
        changedTyped: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.addDescription + ',' +
                DOMstrings.addValue);
            
            nodeListForEach(fields, function(cur){
               cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
            getDOMstrings : function(){
            return DOMstrings;         
    }
        
};
        
    
    
})();



function setFocus(){
        var d = xr('.add__value');
         d.focus();
            
}


var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings(); 
        document.querySelector(DOM.inputBtn).addEventListener('click', addClickItem );
        
        var b =  document.addEventListener('keypress', function(event){
        if (event.keyCode === 13 || event.which === 13) {
            setFocus();
        }
        });
        
        var c = document.addEventListener('keypress', function(event){
        if (event.keyCode === 13 || event.which === 13) {
            addClickItem();
        }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem );
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedTyped);
        
        
        if (DOM.addValue === "") {
            return b;
        } else {
            return c;
        }
        
    };
    
    var updatePercentages = function(){
        budgetCtrl.calculatePercentage();
        
        var perc = budgetCtrl.getPercentages();
        
        UICtrl.displayPercentage(perc);
    };
    
    
    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        
    var budget = budgetCtrl.getBudget();
        
        UICtrl.displayBudget(budget);
    };
        
    var addClickItem = function(){
        var input, newItem, displayItem;
        
        input = UICtrl.getInput(); 
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        newItem = budgetCtrl.addItem(input.type,input.description,input.value);
        
        displayItem = UICtrl.addListItem(newItem, input.type);
        
        UICtrl.clearFields();
        
        updateBudget();
            
        updatePercentages();
        }
        
    };
    
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            
            budgetCtrl.deleteItem(type, ID); 
            
            UICtrl.deleteListItem(itemID);
            
            updateBudget();
            
            updatePercentages();
        }  
    };
   
    
   return {
       init: function(){
           console.log('Application has started');
           UICtrl.displayMonth();
           UICtrl.displayBudget({
               budget: 0,
               totalInc: 0,
               totalExp: 0,
               percentage: -1
           });
           
           setupEventListeners();
       }
   };
   
})(budgetController,UIController);

controller.init();

