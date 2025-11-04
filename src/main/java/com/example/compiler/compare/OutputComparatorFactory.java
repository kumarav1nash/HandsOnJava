package com.example.compiler.compare;

import org.springframework.stereotype.Component;

@Component
public class OutputComparatorFactory {
    public OutputComparator get(ComparatorMode mode) {
        if (mode == null) mode = ComparatorMode.LENIENT;
        switch (mode) {
            case STRICT:
                return new StrictOutputComparator();
            case VERY_LENIENT:
                return new VeryLenientOutputComparator();
            case LENIENT:
            default:
                return new LenientOutputComparator();
        }
    }
}