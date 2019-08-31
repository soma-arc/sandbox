import SPK1_1 from './spk1_1.js';
import Quaternion from './quaternion.js';

/**
 *
 * @param {SPK1_1} m
 * @param {Quaternion} q
 */
export function MobiusOnPoint(m, q) {
    const a = m.a;
    const b = m.b;
    const c = m.c;
    const d = m.d;

    if(q.isInfinity()) {
        if(c.isZero()) {
            return Quaternion.INFINITY;
        }
        return a.mult(c.inverse());
    }

    const left = a.mult(q).add(b);
    const right = c.mult(q).add(d).inverse();
    return left.mult(right);
}

/**
 *
 * @param {SPK1_1} m
 */
export function ComputeDelta(m) {
    return m.a.add( m.d.cliffordTransposition() ).imag().sqNorm() + 4 * m.b.k * m.c.k;
}

/**
 *
 * @param {SPK1_1} m
 */
export function computeFixedPoint(m) {
    const sigma = m.c.mult(m.c.cliffordTransposition().inverse());
    const tau = sigma.mult(m.a.cliffordTransposition()).add(m.d);
    const delta = ComputeDelta(m);
    let t = Quaternion.ONE;

    if(sigma.equals(Quaternion.ONE)) {
        if(tau.isReal()) {
            if(Math.abs(m.trace().re) >= 2) {
                t = tau.scale(0.5).add( tau.scale(0.5).mult(tau.scale(0.5)).sub(Quaternion.ONE).sqrt() );
            } else {
                // There are infinite number of fixed points
                console.log('(1) infinity');
            }
        } else {
            const TValue = tau.re + Math.sqrt((tau.re * tau.re - delta - 4)/2 + Math.sqrt(Math.pow(delta + 4 - tau.re * tau.re, 2) + 4 * tau.re * tau.re * delta));
            const T = new Quaternion(TValue, 0, 0, 0);
            const NValue = TValue / (TValue - 2 * tau.re());
            const N = new Quaternion(NValue, 0, 0, 0);
            t = (T.sub(tau)).inverse().mult(N.sub(sigma));
        }
    } else {
        if (delta <= 0) {
            const N = Quaternion.ONE;
            const TValue = tau.re - Math.sqrt(-delta);
            const T = new Quaternion(TValue, 0, 0, 0);
            t = T.sub(tau).inverse().mult(N.sub(sigma));
        } else {
            const TValue = tau.re + Math.sqrt((tau.re * tau.re - delta - 4)/2 + Math.sqrt(Math.pow(delta + 4 - tau.re * tau.re, 2) + 4 * tau.re * tau.re * delta));
            const T = new Quaternion(TValue, 0, 0, 0);
            const NValue = TValue / (TValue - 2 * tau.re);
            const N = new Quaternion(NValue, 0, 0, 0);
            t = (T.sub(tau)).inverse().mult(N.sub(sigma));
        }
    }

    return m.c.inverse().mult(t.sub(m.d));
}
