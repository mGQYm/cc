const translations = {
    zh: {
        errors: {
            productNotFound: '产品未找到',
            customerNotFound: '客户未找到',
            orderNotFound: '订单未找到',
            inventoryNotFound: '库存记录未找到',
            serverError: '服务器内部错误',
            validationError: '验证错误'
        },
        success: {
            productDeleted: '产品删除成功',
            customerDeleted: '客户删除成功',
            orderDeleted: '订单删除成功',
            inventoryDeleted: '库存记录删除成功',
            created: '创建成功',
            updated: '更新成功'
        }
    },
    en: {
        errors: {
            productNotFound: 'Product not found',
            customerNotFound: 'Customer not found',
            orderNotFound: 'Order not found',
            inventoryNotFound: 'Inventory record not found',
            serverError: 'Internal server error',
            validationError: 'Validation error'
        },
        success: {
            productDeleted: 'Product deleted successfully',
            customerDeleted: 'Customer deleted successfully',
            orderDeleted: 'Order deleted successfully',
            inventoryDeleted: 'Inventory record deleted successfully',
            created: 'Created successfully',
            updated: 'Updated successfully'
        }
    }
};

class LanguageMiddleware {
    static getTranslation(req, key, defaultValue = '') {
        const lang = req.headers['accept-language'] || 'zh';
        const keys = key.split('.');
        let result = translations[lang] || translations['zh'];
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return defaultValue || key;
            }
        }
        
        return result || defaultValue || key;
    }

    static middleware(req, res, next) {
        res.locals.t = (key, defaultValue) => {
            return LanguageMiddleware.getTranslation(req, key, defaultValue);
        };
        next();
    }
}

module.exports = LanguageMiddleware;